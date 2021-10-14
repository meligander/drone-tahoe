const jwt = require('jsonwebtoken');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../config/.env') });

module.exports = function (req, res, next) {
	//Get token from header
	const token = req.header('auth-token');

	//Check if no token
	if (!token) {
		res.status(401).json({ msg: 'No token, authorization denied' });
	}

	//Verify token
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(401).json({ msg: 'Your session has expired' });
	}
};
