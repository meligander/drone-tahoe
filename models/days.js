module.exports = (sequelize, type) => {
	const Day = sequelize.define('day', {
		date: { type: type.DATE, allowNull: false },
		reservations: type.JSON,
	});

	return Day;
};
