const router = require('express').Router();
const Op = require('sequelize').Op;

//Middleware
const auth = require('../../middleware/auth');

//Models
const { JobXReservation, Reservation, Job, User } = require('../../config/db');

//@route    GET api/res/job/:job_res_id
//@desc     Get jobs x reservation Info
//@access   Private
router.get('/:res_job_id', [auth], async (req, res) => {
	try {
		const jobXReservation = await JobXReservation.findOne({
			where: {
				id: req.params.res_job_id,
			},
		});

		if (!jobXReservation) {
			return res.status(400).json({ msg: 'Job per Reservation not found' });
		}

		res.json(jobXReservation);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/res/job/reservation/:reservation_id
//@desc     Get all jobs for a reservation
//@access   Private
router.get('/reservation/:reservation_id', [auth], async (req, res) => {
	try {
		const jobsXReservations = await JobXReservation.findAll({
			where: {
				reservationId: req.params.reservation_id,
			},
			...(req.query.type === 'full' && {
				include: [
					{
						model: Job,
						as: 'job',
					},
				],
			}),
		});

		if (jobsXReservations.length === 0) {
			return res.status(400).json({
				msg: 'No job for this reservation found',
			});
		}

		res.json(jobsXReservations);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/res/job/user/:user_id
//@desc     Get all reservations for a user
//@access   Private
router.get('/user/:user_id', [auth], async (req, res) => {
	try {
		const jobsXReservations = await JobXReservation.findAll({
			include: [
				{
					model: Reservation,
					as: 'reservation',
					where: {
						userId: req.params.user_id,
						hourFrom: {
							[Op.gte]: new Date(req.query.hourFrom).setUTCHours(00, 00, 00),
						},
					},
				},
				{
					model: Job,
					as: 'job',
				},
			],
		});

		if (jobsXReservations.length === 0) {
			return res.status(400).json({
				msg: 'No job for this reservation found',
			});
		}

		res.json(jobsXReservations);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/res/job/jobs/:job_list
//@desc     Get all jobs for a reservation
//@access   Private
router.get('/jobs/:job_list', [auth], async (req, res) => {
	try {
		const jobs = req.params.job_list.split(',');

		let allUsers = [];

		const jobsXreservations = await JobXReservation.findAll({
			where: {
				jobId: jobs,
			},
			include: [
				{
					model: Job,
					as: 'job',
				},
				{
					model: Reservation,
					as: 'reservation',
					include: [
						{
							model: User,
							as: 'user',
						},
					],
				},
			],
		});

		if (jobsXreservations.length === 0) {
			return res.status(400).json({
				msg: 'No matches found for that type of job',
			});
		}

		for (let x = 0; x < jobsXreservations.length; x++) {
			const index = allUsers.findIndex(
				(item) =>
					item.reservation.userId === jobsXreservations[x].reservation.userId
			);

			if (index === -1)
				allUsers.push({
					...jobsXreservations[x].toJSON(),
					jobs: [jobsXreservations[x].job.toJSON()],
				});
			else {
				{
					if (
						!allUsers[index].jobs.some(
							(item) => item.id === jobsXreservations[x].jobId
						)
					) {
						allUsers[index] = {
							...allUsers[index],
							jobs: [
								...allUsers[index].jobs,
								jobsXreservations[x].job.toJSON(),
							],
						};
					}
				}
			}
		}

		res.json(allUsers);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

module.exports = router;
