const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const sequelize = require('sequelize');
const Op = sequelize.Op;

//Middleware
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');

//Model
const { User } = require('../../config/db');

//@route    GET /api/user
//@desc     Get all user || with filter
//@access   Private & Admin
router.get('/', [auth, adminAuth], async (req, res) => {
	try {
		let users = [];

		if (Object.entries(req.query).length === 0) {
			users = await User.findAll({
				attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
				order: [
					['lastname', 'asc'],
					['name', 'asc'],
				],
			});
		} else {
			let filter = {
				type: !req.query.type ? { $ne: 'customer' } : req.query.type,
				...(req.query.name && {
					name: { [Op.like]: sequelize.literal("'%" + req.query.name + "%'") },
				}),
				...(req.query.lastname && {
					lastname: {
						[Op.like]: sequelize.literal("'%" + req.query.lastname + "%'"),
					},
				}),
				...(req.query.email && {
					email: {
						[Op.like]: sequelize.literal("'%" + req.query.email + "%'"),
					},
				}),
			};

			users = await User.findAll({
				where: filter,
				attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
				order: [['email', 'asc']],
			});
		}

		if (users.length === 0) {
			return res.status(400).json({
				msg: 'No users with those characteristics',
			});
		}
		res.json(users);
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET api/user
//@desc     Get logged user's info
//@access   Private
router.get('/info', auth, async (req, res) => {
	try {
		const user = await User.findOne({
			where: { id: req.user.id },
			attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
		});

		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    GET /api/user/:id
//@desc     Get a user
//@access   Private
router.get('/:id', [auth], async (req, res) => {
	try {
		const user = await User.findOne({
			where: { id: req.params.id },
			attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
		});

		if (!user) {
			return res.status(400).json({ msg: 'User Not Found' });
		}

		res.json(user);
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ msg: 'Server Error' });
	}
});

//@route    PUT /api/user/:id
//@desc     Register or Update a user
//@access   Private
router.put(
	'/:id',
	[
		auth,
		adminAuth,
		check('name', 'Name is required').not().isEmpty(),
		check('lastname', 'Lastame is required').not().isEmpty(),
		check('email', 'Email is required').isEmail(),
		check('type', 'Type is required').not().isEmpty(),
		check('cel', 'Cellphone is required').not().isEmpty(),
	],
	async (req, res) => {
		const { name, lastname, email, cel, type, homeTown } = req.body;

		let user;

		let errors = [];
		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) errors = errorsResult.array();

		const regex1 = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
		const regex2 =
			/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

		try {
			let salt;
			if (req.params.id === '0') {
				if (!regex1.test(email))
					errors.push({ msg: 'Invalid email', param: 'email' });

				user = await User.findOne({ where: { email } });

				if (user) errors.push({ msg: 'User already exists', param: 'email' });

				salt = await bcrypt.genSalt(10);
			}

			if (!regex2.test(cel))
				errors.push({ msg: 'Invalid cellphone', param: 'cel' });

			if (errors.length > 0) return res.status(400).json({ errors });

			let data = {
				name,
				lastname,
				type,
				email,
				cel,
				...(homeTown && { homeTown }),
				...(req.params.id === '0' && {
					password: await bcrypt.hash('12345678', salt),
				}),
			};

			console.log(req.params.id, data);

			if (req.params.id === '0') {
				user = await User.create(data);
				user.password = undefined;
			} else {
				await User.update(data, {
					where: { id: req.params.id },
				});

				user = await User.findOne({
					where: { id: req.params.id },
					attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
				});
			}

			res.json(user);
		} catch (err) {
			console.error(err.message);
			return res.status(500).json({ msg: 'Server Error' });
		}
	}
);

//@route    PUT /api/user
//@desc     Register or Update same user
//@access   Private
router.put(
	'/:id',
	[
		auth,
		check('name', 'Name is required').not().isEmpty(),
		check('lastname', 'Lastame is required').not().isEmpty(),
		check('cel', 'Cellphone is required').not().isEmpty(),
	],
	async (req, res) => {
		const { name, lastname, cel, homeTown } = req.body;

		let user;

		let errors = [];
		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) errors = errorsResult.array();

		const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

		try {
			if (!regex.test(cel))
				errors.push({ msg: 'Invalid cellphone', param: 'cel' });

			if (errors.length > 0) return res.status(400).json({ errors });

			let data = {
				name,
				lastname,
				cel,
				...(homeTown && homeTown),
			};

			await User.update(data, {
				where: { id: req.user.id },
			});

			user = await User.findOne({
				where: { id: req.user.id },
				attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
			});
			res.json(user);
		} catch (err) {
			console.error(err.message);
			return res.status(500).json({ msg: 'Server Error' });
		}
	}
);

//@route    DELETE /api/user/:id
//@desc     Delete a user
//@access   Private && Admin
router.delete('/:user_id', [auth, adminAuth], async (req, res) => {
	try {
		//Remove user
		await User.destroy({ where: { id: req.params.user_id } });

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ msg: 'Server Error' });
	}
});

module.exports = router;
