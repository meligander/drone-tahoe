const router = require('express').Router();
const moment = require('moment');
const Op = require('sequelize').Op;

//Middleware
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');

//Models
const { Day, Reservation } = require('../../config/db');

//@route    GET api/day/schedule/:month/:year
//@desc     Get disabled and used days of a month
//@access   Public
router.get('/schedule/:month/:year', async (req, res) => {
	try {
		const month = Number(req.params.month);
		const year = Number(req.params.year);

		const monthDays = new Date(year, month + 1, 0).getDate();

		let reservedDays = [];
		let disabledDays = [];
		let hoursDisabledDays = [];

		const days = await Day.findAll({
			where: {
				date: {
					[Op.between]: [
						new Date(year, month, 1).setUTCHours(0, 0, 0),
						new Date(year, month, monthDays).setUTCHours(23, 23, 59),
					],
				},
			},
		});

		for (let x = 0; x < days.length; x++) {
			if (!days[x].reservations) disabledDays.push(days[x].date);
			else {
				if (days[x].reservations.every((item) => item.jobs.length === 0))
					hoursDisabledDays.push(days[x].date);
				else reservedDays.push(days[x].date);
			}
		}

		res.json({ disabledDays, reservedDays, hoursDisabledDays });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/day/:date/:reservation_id
//@desc     Get day availability
//@access   Public
router.get('/:date/:reservation_id', [auth], async (req, res) => {
	try {
		const date = new Date(req.params.date);

		const day = await Day.findOne({
			where: {
				date: {
					[Op.between]: [
						new Date(date).setUTCHours(00, 00, 00),
						new Date(date).setUTCHours(23, 59, 59),
					],
				},
			},
		});

		if (!day) return res.json([[8, 17]]);

		let reservations = day.reservations;

		if (req.params.reservation_id !== '0')
			reservations = reservations.filter(
				(item) => item !== Number(req.params.reservation_id)
			);

		if (reservations.length === 0) return res.json([[8, 17]]);

		for (let x = 0; x < reservations.length; x++) {
			reservations[x] = await Reservation.findOne({
				where: { id: reservations[x] },
			});
		}

		reservations = reservations.sort((a, b) =>
			moment(a.hourFrom).diff(moment(b.hourFrom))
		);

		const time = req.user.type === 'customer' ? 2 : 1;

		let finalArray = [];
		let newArray = [];

		//[10,12], [15,17] ==> [8,10],[12,15]
		//[8,10], [16,17] ==> [10,16]
		//[11,14] ==> [8,11],[14,17]
		//[10,13] ==> [8,10],[13,17]
		for (let x = 0; x < reservations.length; x++) {
			newArray = [
				x === 0
					? 8
					: moment(reservations[x - 1].hourTo)
							.utc()
							.hour(),
				moment(reservations[x].hourFrom).utc().hour(),
			];

			if (newArray[1] - newArray[0] > time) finalArray.push(newArray);

			if (
				x === reservations.length - 1 &&
				17 - Number(moment(reservations[x].hourTo).utc().hour()) > time
			)
				finalArray.push([moment(reservations[x].hourTo).utc().hour(), 17]);
		}

		res.json(finalArray);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/day/:month/:year/:reservation_id
//@desc     Get unavailability of a month
//@access   Public
router.get('/:month/:year/:reservation_id', [auth], async (req, res) => {
	try {
		const month = Number(req.params.month);
		const year = Number(req.params.year);

		const monthDays = new Date(year, month + 1, 0).getDate();

		let disabledDays = [];

		const days = await Day.findAll({
			where: {
				date: {
					[Op.between]: [
						new Date(year, month, 1).setUTCHours(0, 0, 0),
						new Date(year, month, monthDays).setUTCHours(23, 23, 59),
					],
				},
			},
		});

		const time = req.user.type === 'customer' ? 2 : 1;

		for (let x = 0; x < days.length; x++) {
			let pass = false;

			if (days[x].reservations) {
				let reservations = days[x].reservations;

				if (req.params.reservation_id !== '0')
					reservations = reservations.filter(
						(item) => item !== Number(req.params.reservation_id)
					);

				if (reservations.length > 0) {
					for (let y = 0; y < reservations.length; y++) {
						reservations[y] = await Reservation.findOne({
							where: { id: reservations[y] },
						});
					}

					reservations = reservations.sort((a, b) =>
						moment(a.hourFrom).diff(moment(b.hourFrom))
					);

					let newArray = [];

					for (let y = 0; y < reservations.length; y++) {
						newArray = [
							y === 0
								? 8
								: moment(reservations[y - 1].hourTo)
										.utc()
										.hour(),
							moment(reservations[y].hourFrom).utc().hour(),
						];

						if (
							newArray[1] - (newArray[0] + 1) > time ||
							(y === reservations.length - 1 &&
								17 - Number(moment(reservations[y].hourTo).utc().hour()) > time)
						) {
							pass = true;
						}
					}
				} else pass = true;
			}

			if (!pass) disabledDays.push(days[x].date);
		}
		const weekends = weekendsInMonth(Number(month) + 1, year);

		disabledDays = disabledDays.concat(weekends);

		res.json(disabledDays);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    POST api/day/:date
//@desc     Disable a date
//@access   Private && Admin
router.post('/:date', [auth, adminAuth], async (req, res) => {
	try {
		const day = await Day.findOne({
			where: {
				date: {
					[Op.between]: [
						new Date(req.params.date).setUTCHours(00, 00, 00),
						new Date(req.params.date).setUTCHours(23, 59, 59),
					],
				},
			},
		});

		if (day) {
			return res
				.status(400)
				.json({ msg: 'There are reservations on this date' });
		} else {
			const newDay = {
				date: new Date(req.params.date).setUTCHours(0, 0, 0),
				reservations: null,
			};

			await Day.create(newDay);
		}

		res.json({ msg: 'Date disabled' });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    POST api/day/:date
//@desc     Disable all dates in a date range
//@access   Private && Admin
router.post('/:dateFrom/:dateTo', [auth, adminAuth], async (req, res) => {
	try {
		let startDate = new Date(req.params.dateFrom);
		let endDate = new Date(req.params.dateTo);

		let disabledDays = [];

		const days = await Day.findAll({
			where: {
				date: {
					[Op.between]: [
						startDate.setUTCHours(00, 00, 00),
						endDate.setUTCHours(23, 59, 59),
					],
				},
			},
		});

		if (days.length > 0) {
			return res
				.status(400)
				.json({ msg: 'There are reservations on this date range' });
		} else {
			const day = 60 * 60 * 24 * 1000;
			endDate.setUTCHours(0, 0, 0);

			while (startDate.getTime() <= endDate.getTime()) {
				if (startDate.getDay() !== 6 && startDate.getDay() !== 5) {
					await Day.create({
						date: startDate,
						reservations: null,
					});

					disabledDays.push(startDate);
				}

				startDate = new Date(startDate.getTime() + day);
			}
		}

		res.json(disabledDays);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    DELETE api/day/:date
//@desc     Enable a date after it being disabled
//@access   Private && Admin
router.delete('/:date', [auth, adminAuth], async (req, res) => {
	try {
		await Day.destroy({
			where: {
				date: {
					[Op.between]: [
						new Date(req.params.date).setUTCHours(00, 00, 00),
						new Date(req.params.date).setUTCHours(23, 59, 59),
					],
				},
			},
		});

		res.json({ msg: 'Date Enabled' });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

const weekendsInMonth = (m, y) => {
	const days = new Date(y, m, 0).getDate();

	let weekend = [
		7 - new Date(m + '/01/' + y).getDay(),
		8 - new Date(m + '/01/' + y).getDay(),
	];

	for (var i = weekend[0] + 7; i < days; i += 7) {
		weekend.push(i);
		weekend.push(i + 1);
	}

	weekend = weekend.map((day) => {
		const date = new Date(y, m - 1, day);
		date.setUTCHours(0, 0, 0);
		return date;
	});

	return weekend;
};

module.exports = router;
