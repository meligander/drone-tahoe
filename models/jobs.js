module.exports = (sequelize, type) => {
	return sequelize.define('job', {
		id: {
			type: type.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		title: { type: type.STRING, allowNull: false, unique: true },
		subtitle: type.STRING,
		poptext: type.TEXT,
		time: { type: type.INTEGER, allowNull: false },
		price: { type: type.DOUBLE, allowNull: false },
	});
};
