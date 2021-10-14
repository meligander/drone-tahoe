const Sequelize = require('sequelize');
require('dotenv').config();

const UserModel = require('../models/users');
const ReservationModel = require('../models/reservations');
const DayModel = require('../models/days');
const JobModel = require('../models/jobs');

const sequelize = new Sequelize(
	process.env.SQL_DATABASE,
	process.env.SQL_USERNAME,
	process.env.SQL_PASSWORD,
	{
		host: 'localhost',
		dialect: 'mysql',
	}
);

/* const sequelize = new Sequelize(
	process.env.SQL_TEST_DATABASE,
	process.env.SQL_TEST_USERNAME,
	process.env.SQL_TEST_PASSWORD,
	{
		host: 's29oj5odr85rij2o.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
		dialect: 'mysql',
	}
); */

const User = UserModel(sequelize, Sequelize);
const Reservation = ReservationModel(sequelize, Sequelize);
const Day = DayModel(sequelize, Sequelize);
const Job = JobModel(sequelize, Sequelize);

User.hasMany(Reservation, { as: 'reservations', foreignKey: 'userId' });
Reservation.belongsTo(User, { as: 'user', foreignKey: 'userId' });
/* Job.hasMany(Reservation, { as: 'reservations', foreignKey: 'jobId' });
Reservation.belongsTo(Job, { as: 'job', foreignKey: 'jobId' }); */

sequelize.sync({ force: false }).then(() => {
	console.log('Table sync done');
});

module.exports = {
	User,
	Reservation,
	Day,
	Job,
};
