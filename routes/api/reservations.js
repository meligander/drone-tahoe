const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const moment = require('moment');
const Op = require('sequelize').Op;
const path = require('path');

require('dotenv').config({
	path: path.resolve(__dirname, '../../config/.env'),
});

//Paypal
const paypal = require('@paypal/checkout-server-sdk');
const Environment =
	process.env.NODE_ENV === 'production'
		? paypal.core.LiveEnvironment
		: paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
	new Environment(
		process.env.PAYPAL_CLIENT_ID,
		process.env.PAYPAL_CLIENT_SECRET
	)
);

//Email
const { sendToCompany, sendEmail } = require('../../config/emailSender');

//Middleware
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');

//Models
const {
	Reservation,
	Day,
	User,
	Job,
	JobXReservation,
} = require('../../config/db');

//@route    GET api/reservation/:reservation_id
//@desc     Get the info of a reservation
//@access   Private
router.get('/:reservation_id', [auth], async (req, res) => {
	try {
		const reservation = await Reservation.findOne({
			where: {
				id: req.params.reservation_id,
			},
			order: [['hourFrom', 'desc']],
			include: [
				{
					model: User,
					as: 'user',
					attributes: { exclude: ['password'] },
				},
			],
		});

		if (!reservation) {
			return res.status(400).json({ msg: 'Reservation not found' });
		}

		if (reservation.jobs.length > 0)
			for (let x = 0; x < reservation.jobs.length; x++)
				reservation.jobs[x] = await Job.findOne({
					where: { id: reservation.jobs[x] },
				});

		res.json(reservation);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/reservation
//@desc     Get all reservations
//@access   Private
router.get('/', [auth], async (req, res) => {
	try {
		const filter = {
			...(req.query.user && { userId: req.query.user }),
			...(req.query.status && { status: req.query.status }),
			...(req.query.available && {
				status: {
					[Op.not]: ['canceled', 'refunded'],
				},
			}),
			...((req.query.hourFrom || req.query.hourTo) && {
				hourFrom: {
					...(req.query.hourFrom && req.query.hourTo
						? {
								[Op.between]: [
									new Date(req.query.hourFrom).setUTCHours(00, 00, 00),
									new Date(req.query.hourTo).setUTCHours(23, 59, 59),
								],
						  }
						: req.query.hourFrom
						? { [Op.gte]: new Date(req.query.hourFrom).setUTCHours(00, 00, 00) }
						: { [Op.lte]: new Date(req.query.hourTo).setUTCHours(23, 59, 59) }),
				},
			}),
		};

		const reservations = await Reservation.findAll({
			where: filter,
			order: [['hourFrom', 'asc']],
			include: [
				{
					model: User,
					as: 'user',
					where: req.query.type !== 'all' && {
						type: {
							[Op.not]: 'admin',
						},
					},
					attributes: { exclude: ['password'] },
				},
			],
		});

		if (reservations.length === 0) {
			return res.status(400).json({
				msg: 'No reservation with those characteristics',
			});
		}

		res.json(reservations);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    POST api/reservation/
//@desc     Make a reservation
//@access   Private
router.post(
	'/',
	[
		auth,
		[
			check('user', 'User is required').not().isEmpty(),
			check('hourFrom', 'Time is required').not().isEmpty(),
			check('hourTo', 'Time is required').not().isEmpty(),
			check('address', 'Address is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		let errors = [];
		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) errors = errorsResult.array();

		let {
			hourFrom,
			hourTo,
			user,
			jobs,
			address,
			comments,
			total,
			travelExpenses,
		} = req.body;

		if (travelExpenses !== null && travelExpenses === '')
			errors.push({
				msg: 'Travel Expenses fields can not be empty',
				param: 'travelExpenses',
			});

		errors = checkReservation(jobs, errors, req.user.type);

		if (errors.length > 0) return res.status(400).json({ errors });

		hourFrom = new Date(hourFrom);
		hourTo = new Date(hourTo);

		const reservationFields = {
			hourFrom,
			hourTo,
			userId: user,
			address,
			...(comments && { comments }),
			...(total && { total }),
			travelExpenses,
			status: req.user.type === 'admin' ? 'unpaid' : 'requested',
		};

		try {
			let reservation = await Reservation.create(reservationFields);

			reservation = await Reservation.findOne({
				where: { id: reservation.id },
				order: [['hourFrom', 'desc']],
				include: [
					{ model: User, as: 'user', attributes: { exclude: ['password'] } },
				],
			});

			for (let x = 0; x < jobs.length; x++) {
				const jobsXReservationFields = {
					reservationId: reservation.id,
					jobId: jobs[x].jobId,
					value: jobs[x].value === '' ? 0 : jobs[x].value,
					...(jobs[x].discount !== null && { discount: jobs[x].discount }),
				};

				await JobXReservation.create(jobsXReservationFields);
			}

			await addResToDay(reservation);

			hourFrom = moment(hourFrom);
			hourTo = moment(hourTo);

			if (req.user.type === 'admin') {
				await sendEmail(
					reservation.user.email,
					'Reservation Registered',
					`Hello ${reservation.user.name} ${reservation.user.lastname}!
					<br/><br/>
					A reservation has been registered on the ${hourFrom
						.utc()
						.format('MM/DD/YY')} from ${hourFrom
						.utc()
						.format('h a')} to ${hourTo
						.utc()
						.format('h a')} and its payment is pending.
					<br/>
					Login into your account <a href='${
						process.env.WEBPAGE_URI
					}login/'>Login</a>.<br/>
					Please follow this <a href='${process.env.WEBPAGE_URI}reservation/0/'>Link</a> 
					and click on the money symbol on the reservation to complete payment.`
				);
			} else {
				await sendToCompany(
					'Reservation Requested',
					`The user ${reservation.user.name} ${
						reservation.user.lastname
					}, email ${
						reservation.user.email
					}, has requested a reservation for the ${hourFrom
						.utc()
						.format('MM/DD/YY')} from ${hourFrom
						.utc()
						.format('h a')} to ${hourTo.utc().format('h a')}. 
						<br/>
						Set the price and correct time for the job 
						so the user can proceed with the payment.`
				);
			}

			return res.json(reservation);
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ msg: 'Server Error' });
		}
	}
);

//@route    POST api/reservation/disable
//@desc     Disable Hour Range
//@access   Private
router.post(
	'/disable',
	[
		auth,
		adminAuth,
		[
			check('user', 'User is required').not().isEmpty(),
			check('hourFrom', 'Start Time is required').not().isEmpty(),
			check('hourTo', 'End Time is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		let errors = [];
		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) errors = errorsResult.array();

		let { hourFrom, hourTo, user } = req.body;

		if (errors.length > 0) return res.status(400).json({ errors });

		hourFrom = new Date(hourFrom);
		hourTo = new Date(hourTo);

		let reservationFields = {
			hourFrom,
			hourTo,
			userId: user,
			jobs: [],
			address: '',
			value: 0,
			status: 'hourRange',
		};

		try {
			let reservation = await Reservation.create(reservationFields);

			reservation = await Reservation.findOne({
				where: { id: reservation.id },
				order: [['hourFrom', 'desc']],
				include: [
					{ model: User, as: 'user', attributes: { exclude: ['password'] } },
				],
			});

			await addResToDay(reservation);

			return res.json(reservation);
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ msg: 'Server Error' });
		}
	}
);

//@route    POST api/reservation/payment
//@desc     Make reservation payment
//@access   Private
router.post('/payment', [auth], async (req, res) => {
	let { jobs, total } = req.body;

	const request = new paypal.orders.OrdersCreateRequest();

	const discount = jobs.reduce((sum, item) => sum + item.discount, 0);

	/* "amount": {
		"currency_code": "USD",
		"value": "90.00",
			"breakdown": {
				"item_total": {
					 "currency_code": "USD",
					 "value": "100.00"
				 },
				"discount": {
					 "currency_code": "USD",
					 "value": "10.00"
				 }
			 }
		},
	"items": [] */

	request.prefer('return=representation');
	request.requestBody({
		intent: 'CAPTURE',
		purchase_units: [
			{
				amount: {
					currency_code: 'USD',
					value: total,
					breakdown: {
						item_total: {
							currency_code: 'USD',
							value: total + discount,
						},
						discount: {
							currency_code: 'USD',
							value: discount,
						},
					},
				},
				items: jobs.map((item) => {
					return {
						name: item.job.title,
						unit_amount: {
							currency_code: 'USD',
							value: item.value,
						},
						quantity: 1,
					};
				}),
			},
		],
		application_context: {
			shipping_preference: 'NO_SHIPPING',
		},
	});

	try {
		const order = await paypalClient.execute(request);

		res.json({ id: order.result.id });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    POST api/reservation/payment/:reservation_id
//@desc     Update payment status
//@access   Private
router.post('/payment/:reservation_id', [auth], async (req, res) => {
	try {
		const { paymentId } = req.body;

		let reservation = await Reservation.findOne({
			where: { id: req.params.reservation_id },
			include: [
				{ model: User, as: 'user', attributes: { exclude: ['password'] } },
			],
		});

		reservation.status = paymentId ? 'pending' : 'paid';
		if (paymentId) reservation.paymentId = paymentId;

		await reservation.save();

		const hourFrom = moment(reservation.hourFrom);
		const hourTo = moment(reservation.hourTo);

		await sendEmail(
			reservation.user.email,
			'Reservation Paid',
			`Hello ${reservation.user.name} ${reservation.user.lastname}!
			<br/><br/>
			The reservation registered on the ${hourFrom
				.utc()
				.format('MM/DD/YY')} from ${hourFrom.utc().format('h a')} to ${hourTo
				.utc()
				.format('h a')} has been paid.
				<br/>
				The amount paid was $${reservation.total}.`
		);

		if (req.user.type === 'customer')
			await sendToCompany(
				'Reservation Paid',
				`The user ${reservation.user.name} ${
					reservation.user.lastname
				}, email ${reservation.user.email}, has paid $${reservation.total} ${
					reservation.paymentId ? `(PayPal ID: ${reservation.paymentId}) ` : ''
				}for the reservation on the ${hourFrom
					.utc()
					.format('MM/DD/YY')} from ${hourFrom.utc().format('h a')} to ${hourTo
					.utc()
					.format('h a')}.`
			);

		res.json(reservation);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/reservation/payment/:reservation_id
//@desc     See payment details
//@access   Private
router.get('/payment/:reservation_id', [auth], async (req, res) => {
	try {
		let reservation = await Reservation.findOne({
			where: { id: req.params.reservation_id },
		});

		const orderID = reservation.paymentId;

		const request = new paypal.orders.OrdersGetRequest(orderID);

		let order = await paypalClient.execute(request);

		res.json(order.result);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    POST api/reservation/status/update
//@desc     Update pending and paid status
//@access   Private
router.post('/status/update', [auth], async (req, res) => {
	try {
		let pendingReservations = await Reservation.findAll({
			where: { status: 'pending' },
		});

		let completedReservations = await Reservation.findAll({
			where: { hourFrom: { [Op.lte]: new Date() }, status: 'paid' },
		});

		let canceledReservations = await Reservation.findAll({
			where: { status: 'canceled' },
		});

		for (let x = 0; x < pendingReservations.length; x++) {
			const orderID = pendingReservations[x].paymentId;

			if (orderID) {
				const request = new paypal.orders.OrdersGetRequest(orderID);

				let order = await paypalClient.execute(request);
				if (
					order.result.status === 'COMPLETED' &&
					order.result.purchase_units[0].payments.captures.every(
						(item) => item.status === 'COMPLETED'
					)
				) {
					pendingReservations[x].status = 'paid';
					await pendingReservations[x].save();
				}
			}
		}

		for (let x = 0; x < canceledReservations.length; x++) {
			const orderID = canceledReservations[x].paymentId;

			if (orderID) {
				const request = new paypal.orders.OrdersGetRequest(orderID);

				let order = await paypalClient.execute(request);

				if (
					order.result.status === 'COMPLETED' &&
					order.result.purchase_units[0].payments.captures.every(
						(item) => item.status === 'REFUNDED'
					)
				) {
					canceledReservations[x].status = 'refunded';
					await canceledReservations[x].save();
				}
			}
		}

		for (let x = 0; x < completedReservations.length; x++) {
			completedReservations[x].status = 'completed';
			await completedReservations[x].save();
		}

		res.json('Reservations Updated');
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    POST api/reservation/:reservation_id
//@desc     Update a reservation
//@access   Private
router.post(
	'/:reservation_id',
	[auth, [check('address', 'Address is required').not().isEmpty()]],
	async (req, res) => {
		let errors = [];
		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) errors = errorsResult.array();

		let { hourFrom, hourTo, jobs, address, comments, total, travelExpenses } =
			req.body;

		if (travelExpenses !== null && travelExpenses === '')
			errors.push({
				msg: 'Travel Expenses fields can not be empty',
				param: 'travelExpenses',
			});

		errors = checkReservation(jobs, errors, req.user.type);

		if (errors.length > 0) return res.status(400).json({ errors });

		try {
			let reservation = await Reservation.findOne({
				where: { id: req.params.reservation_id },
				include: [
					{ model: User, as: 'user', attributes: { exclude: ['password'] } },
				],
			});

			const originalStatus = reservation.status;

			reservation.address = address;

			if (total) {
				reservation.total = Number(total);
				if (reservation.status === 'requested') reservation.status = 'unpaid';
			}
			if (req.user.type === 'customer' && reservation.status === 'unpaid') {
				reservation.status = 'requested';
				await sendToCompany(
					'Reservation Changed',
					`The user ${reservation.user.name} ${reservation.user.lastname},
					 email ${reservation.user.email}, has made changes to their reservation.<br/>
					Please check if the time and price are correct so they can proceed with its payment.`
				);
			}
			reservation.comments = comments ? comments : null;

			reservation.travelExpenses = travelExpenses;

			if (hourFrom && hourTo) {
				await removeResFromDay(reservation);

				reservation.hourFrom = new Date(hourFrom);
				reservation.hourTo = new Date(hourTo);

				await addResToDay(reservation);
			}

			await reservation.save();

			let originalJobs = await JobXReservation.findAll({
				where: { reservationId: req.params.reservation_id },
			});

			for (let x = 0; x < jobs.length; x++) {
				const jobsXReservationFields = {
					reservationId: req.params.reservation_id,
					jobId: jobs[x].jobId,
					value: jobs[x].value === '' ? 0 : Number(jobs[x].value),
					discount: jobs[x].discount,
				};

				if (jobs[x].id === 0)
					await JobXReservation.create(jobsXReservationFields);
				else {
					await JobXReservation.update(jobsXReservationFields, {
						where: { id: jobs[x].id },
					});

					originalJobs = originalJobs.filter((item) => item.id !== jobs[x].id);
				}
			}

			if (originalJobs.length > 0)
				for (let x = 0; x < originalJobs.length; x++)
					await originalJobs[x].destroy();

			if (originalStatus === 'requested' && total) {
				hourFrom = moment(reservation.hourFrom);
				hourTo = moment(reservation.hourTo);

				await sendEmail(
					reservation.user.email,
					'Reservation ready for payment',
					`Hello ${reservation.user.name} ${reservation.user.lastname}!
					<br/><br/>
					The reservation registered on the ${hourFrom
						.utc()
						.format('MM/DD/YY')} from ${hourFrom
						.utc()
						.format('h a')} to ${hourTo
						.utc()
						.format('h a')} is ready to be paid.
					<br/>
					Login into your account <a href='${
						process.env.WEBPAGE_URI
					}login/'>Login</a>.<br/>
					Follow this <a href='${process.env.WEBPAGE_URI}reservation/0/'>Link</a> 
					and click on the money symbol to complete the payment.`
				);
			}

			return res.json(reservation);
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ msg: 'Server Error' });
		}
	}
);

//@route    POST api/reservation/cancel/:reservation_id
//@desc     Cancel a reservation
//@access   Private
router.post('/cancel/:reservation_id', [auth], async (req, res) => {
	let { amount, refundReason } = req.body;

	if (req.user.type === 'admin' && !amount)
		return res.status(400).json({ msg: 'A refund amount is required' });

	try {
		let reservation = await Reservation.findOne({
			where: { id: req.params.reservation_id },
			include: [
				{ model: User, as: 'user', attributes: { exclude: ['password'] } },
			],
		});

		if (req.user.type === 'customer') {
			amount = reservation.total;
			reservation.status = 'canceled';
		} else {
			amount = Number(amount);
			if (amount === reservation.total) {
				reservation.status = reservation.paymentId ? 'canceled' : 'refunded';
			} else {
				reservation.total = reservation.total - amount;
				reservation.refundReason = refundReason
					? `: ${refundReason}`
					: refundReason;
			}

			reservation.refundReason = refundReason;
		}

		const originalAmount = amount;

		if (reservation.paymentId) {
			const requestID = new paypal.orders.OrdersGetRequest(
				reservation.paymentId
			);

			const order = await paypalClient.execute(requestID);

			const captures = order.result.purchase_units[0].payments.captures;

			let index = 0;

			while (amount > 0) {
				const request = new paypal.payments.CapturesRefundRequest(
					captures[index].id
				);

				const value =
					amount < Number(captures[index].amount.value)
						? amount
						: Number(captures[index].amount.value);

				request.requestBody({
					amount: {
						currency_code: 'USD',
						value,
					},
				});

				amount = amount - captures[index].amount.value;

				await paypalClient.execute(request);
				index++;
			}
		}

		await reservation.save();

		if (originalAmount === reservation.total)
			await removeResFromDay(reservation);

		return res.json(reservation);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    POST api/reservation/delete/:reservation_id
//@desc     Delete a reservation
//@access   Private
router.post('/delete/:reservation_id', [auth], async (req, res) => {
	try {
		//Remove reservation
		const reservation = await Reservation.findOne({
			where: {
				id: req.params.reservation_id,
			},
		});
		if (reservation.status !== 'canceled' && reservation.status !== 'refunded')
			await removeResFromDay(reservation);

		const jobs = await JobXReservation.findAll({
			where: { reservationId: reservation.id },
		});

		jobs.forEach((job) => job.destroy());

		await reservation.destroy();

		res.json({ msg: 'Reservation deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

const removeResFromDay = async (reservation) => {
	const day = await Day.findOne({
		where: {
			date: {
				[Op.between]: [
					new Date(reservation.hourFrom).setUTCHours(0, 0, 0),
					new Date(reservation.hourFrom),
				],
			},
		},
	});

	day.reservations = day.reservations.filter((item) => item !== reservation.id);

	if (day.reservations.length > 0) await day.save();
	else await day.destroy();
};

const addResToDay = async (reservation) => {
	let day = await Day.findOne({
		where: {
			date: {
				[Op.between]: [
					new Date(reservation.hourFrom).setUTCHours(00, 00, 00),
					new Date(reservation.hourTo).setUTCHours(23, 59, 59),
				],
			},
		},
	});

	if (day) {
		day.reservations = [...day.reservations, reservation.id];
		await day.save();
	} else {
		day = {
			date: new Date(reservation.hourFrom).setUTCHours(00, 00, 00),
			reservations: [reservation.id],
		};

		await Day.create(day);
	}
};

const checkReservation = (jobs, errors, type) => {
	if (jobs.length === 0)
		errors.push({ msg: 'You must have at least one job', param: 'jobs' });

	if (jobs.some((item) => item.jobId === ''))
		errors.push({
			msg: 'All jobs must have an item selected',
			param: 'jobs',
		});

	if (type === 'admin') {
		const emptyValue = jobs.some(
			(item) => item.value === '' || item.value === 0
		);
		const emptyDiscount = jobs.some(
			(item) =>
				(item.discount !== null && item.discount === '') || item.discount === 0
		);
		if (emptyValue || emptyDiscount)
			errors.push({
				msg: emptyValue
					? 'All jobs must have a specified value'
					: 'Discount fields can not be empty',
				param: 'jobs',
			});
	}

	return errors;
};

module.exports = router;
