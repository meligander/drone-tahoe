module.exports = (sequelize, type) => {
	return sequelize.define('job', {
		title: { type: type.STRING, allowNull: false, unique: true },
		subtitle: type.STRING,
		poptext: type.TEXT,
	});
};
