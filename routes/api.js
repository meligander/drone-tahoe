const router = require('express').Router();

const apiAuthRouter = require('./api/auth');
const apiUsersRouter = require('./api/users');
const apiJobsRouter = require('./api/jobs');
const apiReservationRouter = require('./api/reservations');
const apiDayRouter = require('./api/days');

router.use('/auth', apiAuthRouter);
router.use('/user', apiUsersRouter);
router.use('/job', apiJobsRouter);
router.use('/reservation', apiReservationRouter);
router.use('/day', apiDayRouter);

module.exports = router;
