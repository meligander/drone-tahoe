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
		address: { type: type.STRING, allowNull: false },
		comments: type.TEXT,
		value: { type: type.FLOAT, allowNull: false },
		jobs: type.JSON,
		status: {
			type: type.ENUM,
			allowNull: false,
			values: [
				'requested',
				'unpaid',
				'pending',
				'paid',
				'completed',
				'canceled',
				'refunded',
			],
		},
	});
};
