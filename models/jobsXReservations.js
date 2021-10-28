module.exports = (sequelize, type) => {
	return sequelize.define('jobsXReservation', {
		value: { type: type.FLOAT, allowNull: false },
		discount: type.FLOAT,
	});
};
