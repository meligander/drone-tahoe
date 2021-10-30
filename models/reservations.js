module.exports = (sequelize, type) => {
	return sequelize.define('reservation', {
		hourFrom: { type: type.DATE, allowNull: false },
		hourTo: { type: type.DATE, allowNull: false },
		paymentId: type.STRING,
		address: { type: type.STRING, allowNull: false },
		total: { type: type.FLOAT },
		travelExpenses: { type: type.FLOAT },
		comments: type.TEXT,
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
				'hourRange',
			],
		},
	});
};
