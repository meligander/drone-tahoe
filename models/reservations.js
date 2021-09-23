module.exports = (sequelize, type) => {
	return sequelize.define('reservation', {
		id: {
			type: type.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		hourFrom: { type: type.DATE, allowNull: false },
		hourTo: { type: type.DATE, allowNull: false },
		paymentId: type.STRING,
		value: { type: type.FLOAT, allowNull: false },
	});
};
