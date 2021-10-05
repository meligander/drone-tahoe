const router = require('express').Router();
const { check, validationResult } = require('express-validator');
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
const { sentToCompany } = require('../../config/emailSender');

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
				{ model: Job, as: 'job' },
			],
		});

		if (!reservation) {
			return res.status(400).json({ msg: 'Reservation not found' });
		}

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
			...(req.query.job && { jobId: req.query.job }),
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
				{ model: Job, as: 'job' },
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
		],
	],
	async (req, res) => {
		let errors = [];
		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) errors = errorsResult.array();

		if (errors.length > 0) return res.status(400).json({ errors });

		let { hourFrom, hourTo, user, job, paymentId } = req.body;

		hourFrom = new Date(hourFrom);
		hourTo = new Date(hourTo);

		let reservationFields = {
			hourFrom,
			hourTo,
			userId: user,
			jobId: job && job.id,
			value: job ? job.price : 0,
			paymentId,
			status: paymentId === '' ? 'completed' : 'processing',
		};

		try {
			let reservation = await Reservation.create(reservationFields);

			reservation = await Reservation.findOne({
				where: { id: reservation.id },
				order: [['hourFrom', 'desc']],
				include: [
					{ model: User, as: 'user', attributes: { exclude: ['password'] } },
					{ model: Job, as: 'job' },
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
			where: { status: 'processing' },
		});

		for (let x = 0; x < reservations.length; x++) {
			const orderID = reservations[x].paymentId;

			const request = new paypal.orders.OrdersGetRequest(orderID);

			let order = await paypalClient.execute(request);

			if (order.result.status === 'COMPLETED') {
				reservations[x].status = 'completed';
				await reservations[x].save();
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

		reservation = {
			...reservation,
			hourFrom: new Date(hourFrom),
			hourTo: new Date(hourTo),
		};

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

		reservation.status = 'canceled';

		reservation.save();

		const hourFrom = moment(reservation.hourFrom);
		const hourTo = moment(reservation.hourTo);

		sentToCompany(
			'Refund',
			`The user ${reservation.user.name} ${reservation.user.lastname}, email ${
				reservation.user.email
			}, has requested a refund for the Paypal payment, ID ${
				reservation.paymentId
			}, for the reservation on the ${hourFrom
				.utc()
				.format('MM/DD/YY')} from ${hourFrom.utc().format('h a')} to ${hourTo
				.utc()
				.format('h a')}`
		);

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

		await Reservation.destroy({ where: { id: reservation.id } });

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
