import { combineReducers } from 'redux';

import auth from './auth';
import alert from './alert';
import day from './day';
import global from './global';
import job from './job';
import reservation from './reservation';
import jobsXreservation from './jobsXReservations';
import user from './user';

export default combineReducers({
	alert,
	auth,
	day,
	global,
	job,
	reservation,
	jobsXreservation,
	user,
});
