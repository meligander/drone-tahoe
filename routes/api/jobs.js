const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const sequelize = require('sequelize');
const Op = sequelize.Op;

//Middleware
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');

//Models
const { Job, Reservation } = require('../../config/db');

//@route    GET api/job/:vessel_id
//@desc     Get type of job information
//@access   Public
router.get('/:job_id', [auth, adminAuth], async (req, res) => {
	try {
		const job = await Job.findOne({
			where: {
				id: req.params.job_id,
			},
		});

		if (!job) {
			return res.status(400).json({ msg: 'Job not found' });
		}

		res.json(job);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/job
//@desc     Get all type of jobs
//@access   Public
router.get('/', async (req, res) => {
	try {
		const filter = {
			...(req.query.title && {
				title: { [Op.like]: sequelize.literal("'%" + req.query.title + "%'") },
			}),
		};

		const jobs = await Job.findAll({
			where: filter,
			order: [['title', 'asc']],
		});

		if (jobs.length === 0) {
			return res.status(400).json({
				msg: 'No job with those characteristics',
			});
		}

		res.json(jobs);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    POST api/job/:job_id
//@desc     Create or update a job type
//@access   Private && Auth
router.post(
	'/:job_id',
	[
		auth,
		adminAuth,
		check('title', 'Title is required').not().isEmpty(),
		check('price', 'Price is required').not().isEmpty(),
		check('time', 'Time is required').not().isEmpty(),
	],
	async (req, res) => {
		let errors = [];

		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) errors = errorsResult.array();

		const { title, subtitle, time, price, poptext } = req.body;

		//Build profile object
		let jobFields = {
			title,
			time,
			price,
			...(subtitle && subtitle !== '' && { subtitle }),
			...(poptext && poptext !== '' && { poptext }),
		};

		try {
			let job;

			console.log(req.params.job_id);

			if (req.params.job_id !== '0') {
				//Update
				await Job.update(jobFields, {
					where: { id: req.params.job_id },
				});

				job = await Job.findOne({ where: { id: req.params.job_id } });
			} else {
				const oldJob = await Job.findOne({ where: { title } });

				if (oldJob)
					errors.push({ msg: 'Job title already exists', param: 'title' });

				if (errors.length > 0) return res.status(400).json({ errors });

				//Create
				job = await Job.create(jobFields);
			}

			return res.json(job);
		} catch (err) {
			console.error(err.message);
			res.status(500).json({ msg: 'Server Error' });
		}
	}
);

//@route    DELETE api/job/:job_id
//@desc     Delete job
//@access   Private && Admin
router.delete('/:job_id', [auth, adminAuth], async (req, res) => {
	try {
		const reservation = await Reservation.findOne({
			where: {
				jobId: req.params.job_id,
			},
		});

		if (reservation)
			return res.status(400).json({
				msg: 'Cannot delete a job that is related to a reservation',
			});

		await Job.destroy({ where: { id: req.params.job_id } });

		res.json({ msg: 'Job deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

module.exports = router;
