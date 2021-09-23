const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const Op = require('sequelize').Op;

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

		console.log(filter, 'holaaaaaaaaaa');

		const reservations = await Reservation.findAll({
			where: filter,
			order: [['hourFrom', 'asc']],
			include: [
				{
					model: User,
					as: 'user',
					where: {
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
			check('user', 'Customer is required').not().isEmpty(),
			check('hourFrom', 'Time is required').not().isEmpty(),
			check('hourTo', 'Time is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		let errors = [];
		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) errors = errorsResult.array();

		if (errors.length > 0) return res.status(400).json({ errors });

		let { hourFrom, hourTo, user, job, value } = req.body;

		hourFrom = new Date(hourFrom);
		hourTo = new Date(hourTo);

		let reservationFields = {
			hourFrom,
			hourTo,
			userId: user,
			jobId: job,
			value,
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

//@route    PUT api/reservation/
//@desc     Update a reservation
//@access   Private
router.put('/:reservation_id', [auth], async (req, res) => {
	let { hourFrom, hourTo } = req.body;

	const reservationFields = {
		hourFrom: new Date(hourFrom),
		hourTo: new Date(hourTo),
	};

	try {
		let reservation = await Reservation.findOne({
			where: { id: req.params.reservation_id },
		});
		await removeResFromDay(reservation);

		await Reservation.update(reservationFields, {
			where: { id: req.params.reservation_id },
		});

		reservation = await Reservation.findOne({
			where: { id: req.params.reservation_id },
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
});

//@route    PUT api/reservation/pay/:reservation_id
//@desc     Make reservation payment
//@access   Private
router.put('/pay/:reservation_id', [auth], async (req, res) => {
	try {
		//change reservation status
		const reservation = await Reservation.findOne({
			where: {
				id: req.params.reservation_id,
			},
		});

		//Make Paypal payment

		reservation.paymentId = 'whatever id returns';
		reservation.save();

		res.json({ msg: 'Reservation canceled' });
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

		//Cancel Paypal payment

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
