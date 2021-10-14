const { User } = require('../config/db');

module.exports = async function (req, res, next) {
	try {
		const user = await User.findOne({ where: { id: req.user.id } });

		if (user.type !== 'admin') {
			return res.status(401).json({
				msg: 'Unauthorized User',
			});
		}
		next();
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ msg: 'Server Auth Error' });
	}
};
