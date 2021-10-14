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

//Models
const { Reservation, Day, User, Job } = require('../../config/db');

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

		if (reservation.jobs > 0)
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

		let { hourFrom, hourTo, user, jobs, address, comments, value } = req.body;

		const regex1 = /^\$?\d+(\.(\d{2}))?$/;

		if (req.user.type === 'admin') {
			if (!value) errors.push({ msg: 'Value is required', param: 'value' });
			else if (!regex1.test(value))
				errors.push({ msg: 'Invalid Price. eg: 350.50', param: 'value' });
		}

		if (jobs.length === 0)
			errors.push({ msg: 'You must have at least one job', param: 'jobs' });

		if (jobs.some((item) => item === ''))
			errors.push({
				msg: 'All jobs must have an item selected',
				param: 'jobs',
			});

		if (errors.length > 0) return res.status(400).json({ errors });

		hourFrom = new Date(hourFrom);
		hourTo = new Date(hourTo);

		let reservationFields = {
			hourFrom,
			hourTo,
			userId: user,
			jobs,
			address,
			...(value && { value }),
			...(comments && { comments }),
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

			if (req.user.type === 'customer')
				for (let x = 0; x < jobs.length; x++)
					reservation.jobs[x] = await Job.findOne({
						where: { id: jobs[x] },
					});

			await addResToDay(reservation);

			hourFrom = moment(hourFrom);
			hourTo = moment(hourTo);

			if (req.user.type === 'admin') {
				await sendEmail(
					reservation.user.email,
					'Reservation Registered',
					`Hello ${reservation.user.name} ${reservation.user.lastname}!
					A reservation has been registered on the ${hourFrom
						.utc()
						.format('MM/DD/YY')} from ${hourFrom
						.utc()
						.format('h a')} to ${hourTo
						.utc()
						.format('h a')} and its payment is pending for it to be completed.
					<br/>
					After login into your account <a href='${
						process.env.WEBPAGE_URI
					}login/'>Login</a>
					Follow this link to pay the reservation <a href='${
						process.env.WEBPAGE_URI
					}reservations/0/'>Reservations</a>`
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
						Determine the price and correct time for the job so the user can proceed with the payment`
				);
			}

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
	let { job } = req.body;

	const request = new paypal.orders.OrdersCreateRequest();

	request.prefer('return=representation');
	request.requestBody({
		intent: 'CAPTURE',
		purchase_units: [
			{
				amount: {
					currency_code: 'USD',
					value: job.price,
					breakdown: {
						item_total: {
							currency_code: 'USD',
							value: job.price,
						},
					},
				},
				items: [
					{
						name: job.title,
						unit_amount: {
							currency_code: 'USD',
							value: job.price,
						},
						quantity: 1,
					},
				],
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

//@route    PUT api/reservation/payment/update
//@desc     Update payment status
//@access   Private
router.put('/payment/update', [auth], async (req, res) => {
	try {
		let reservations = await Reservation.findAll({
			where: { status: 'pending' },
		});

		for (let x = 0; x < reservations.length; x++) {
			const orderID = reservations[x].paymentId;

			if (orderID) {
				const request = new paypal.orders.OrdersGetRequest(orderID);

				let order = await paypalClient.execute(request);

				if (order.result.status === 'COMPLETED') {
					reservations[x].status = 'completed';
					await reservations[x].save();
				}
			}
		}

		res.json('Reservations Updated');
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    PUT api/reservation/:reservation_id
//@desc     Update a reservation
//@access   Private
router.put('/:reservation_id', [auth], async (req, res) => {
	let { hourFrom, hourTo } = req.body;

	try {
		let reservation = await Reservation.findOne({
			where: { id: req.params.reservation_id },
			include: [
				{ model: User, as: 'user', attributes: { exclude: ['password'] } },
				{ model: Job, as: 'job' },
			],
		});
		await removeResFromDay(reservation);

		reservation.hourFrom = new Date(hourFrom);
		reservation.hourTo = new Date(hourTo);

		reservation.save();

		await addResToDay(reservation);

		return res.json(reservation);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    PUT api/reservation/cancel/:reservation_id
//@desc     Cancel a reservation
//@access   Private
router.put('/cancel/:reservation_id', [auth], async (req, res) => {
	try {
		let reservation = await Reservation.findOne({
			where: { id: req.params.reservation_id },
			include: [
				{ model: User, as: 'user', attributes: { exclude: ['password'] } },
				{ model: Job, as: 'job' },
			],
		});

		if (reservation.paymentId !== '') {
			reservation.status = 'canceled';

			reservation.save();

			const hourFrom = moment(reservation.hourFrom);
			const hourTo = moment(reservation.hourTo);

			await sendToCompany(
				'Refund',
				`The user ${reservation.user.name} ${
					reservation.user.lastname
				}, email ${
					reservation.user.email
				}, has requested a refund for the Paypal payment, ID ${
					reservation.paymentId
				}, for the reservation on the ${hourFrom
					.utc()
					.format('MM/DD/YY')} from ${hourFrom.utc().format('h a')} to ${hourTo
					.utc()
					.format('h a')}`
			);
		} else {
			await removeResFromDay(reservation);

			await reservation.destroy();
		}

		return res.json(reservation);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    DELETE api/reservation/:reservation_id
//@desc     Delete a reservation
//@access   Private
router.delete('/:reservation_id', [auth], async (req, res) => {
	try {
		//Remove reservation
		const reservation = await Reservation.findOne({
			where: {
				id: req.params.reservation_id,
			},
		});

		await removeResFromDay(reservation);

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

	if (day.reservations.length > 0) day.save();
	else
		await Day.destroy({
			where: {
				id: day.id,
			},
		});
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
		day.save();
	} else {
		day = {
			date: new Date(reservation.hourFrom).setUTCHours(00, 00, 00),
			reservations: [reservation.id],
		};

		await Day.create(day);
	}
};

module.exports = router;
