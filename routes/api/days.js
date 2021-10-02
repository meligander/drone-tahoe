const router = require('express').Router();
const moment = require('moment');
const Op = require('sequelize').Op;

//Middleware
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');

//Models
const { Day, Job, Reservation } = require('../../config/db');

//@route    GET api/day/:date/:job_id
//@desc     Get day availability
//@access   Public
router.get('/:date/:job_id', async (req, res) => {
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

		console.log(day);

		if (!day) return res.json([[8, 17]]);

		for (let x = 0; x < day.reservations.length; x++) {
			day.reservations[x] = await Reservation.findOne({
				where: { id: day.reservations[x] },
			});
		}

		const reservations = day.reservations.sort((a, b) =>
			moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY'))
		);

		const job =
			req.params.job_id !== 'undefined'
				? await Job.findOne({ where: { id: req.params.job_id } })
				: {
						time: 1,
				  };

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
					: reservations[x].jobId
					? moment(reservations[x - 1].hourTo)
							.utc()
							.hour()
					: moment(reservations[x - 1].hourTo)
							.utc()
							.hour() - 1,
				moment(reservations[x].hourFrom).utc().hour(),
			];

			if (newArray[1] - newArray[0] > job.time) finalArray.push(newArray);

			if (x === reservations.length - 1) {
				const hourTo = moment(reservations[x].hourTo).utc().hour();

				const validation = reservations[x].jobId
					? 17 - hourTo > job.time
					: 17 - hourTo >= job.time;

				if (validation)
					finalArray.push([reservations[x].jobId ? hourTo : hourTo - 1, 17]);
			}
		}

		res.json(finalArray);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/day/schedule/:month/:year
//@desc     Get unavailability of a month
//@access   Public
router.get('/schedule/:month/:year', async (req, res) => {
	try {
		const monthDays = new Date(req.params.year, req.params.month, 0).getDate();

		const month = req.params.month;
		const year = req.params.year;

		let usedDays = [];
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

		for (let x = 0; x < days.length; x++) {
			if (!days[x].reservations) disabledDays.push(days[x].date);
			else usedDays.push(days[x].date);
		}

		res.json({ disabledDays, usedDays });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/day/:job_id/:month/:year
//@desc     Get unavailability of a month
//@access   Public
router.get('/:job_id/:month/:year', async (req, res) => {
	try {
		const monthDays = new Date(req.params.year, req.params.month, 0).getDate();

		const month = req.params.month;
		const year = req.params.year;

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

		const job = await Job.findOne({ where: { id: req.params.job_id } });

		for (let x = 0; x < days.length; x++) {
			let pass = false;

			if (days[x].reservations) {
				for (let y = 0; y < days[x].reservations.length; y++) {
					days[x].reservations[y] = await Reservation.findOne({
						where: { id: days[x].reservations[y] },
					});
				}

				const reservations = days[x].reservations.sort((a, b) =>
					moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY'))
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

					const validation = reservations[y].jobId
						? 17 - moment(reservations[y].hourTo).utc().hour() > job.time
						: 17 - moment(reservations[y].hourTo).utc().hour() >= job.time;

					if (
						newArray[1] - newArray[0] > job.time ||
						(y === reservations.length - 1 && validation)
					)
						pass = true;
				}
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
			console.log(startDate, endDate);
			while (startDate.getTime() <= endDate.getTime()) {
				const newDay = {
					date: startDate,
					reservations: null,
				};

				disabledDays.push(startDate);

				await Day.create(newDay);
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
