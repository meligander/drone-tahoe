import api from '../utils/api';

import {
	DAYAVAILABILITY_LOADED,
	MONTHAVAILABILITY_LOADED,
	DAY_DISABLED,
	DAY_ENABLED,
	DAYSAVAILABILITY_ERROR,
	DAYSAVAILABILITY_CLEARED,
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';

export const checkDayAvailability = (date, job_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	try {
		const res = await api.get(`/day/${date}/${job_id}`);
		dispatch({
			type: DAYAVAILABILITY_LOADED,
			payload: res.data,
		});
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: DAYSAVAILABILITY_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
		window.scrollTo(0, 0);
	}

	dispatch(updateLoadingSpinner(false));
};

export const checkMonthAvailability =
	(job_id, month, year) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));

		try {
			const res = await api.get(`/day/${job_id}/${month}/${year}`);

			dispatch({
				type: MONTHAVAILABILITY_LOADED,
				payload: res.data,
			});
		} catch (err) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch({
				type: DAYSAVAILABILITY_ERROR,
				payload: {
					type: err.response.statusText,
					status: err.response.status,
					msg: err.response.data.msg,
				},
			});
			window.scrollTo(0, 0);
		}

		dispatch(updateLoadingSpinner(false));
	};

export const disableDate = (date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.post(`/day/${date}`);

		dispatch({
			type: DAY_DISABLED,
			payload: res.data,
		});

		dispatch(setAlert('Date successfully disabled', 'success', '1'));
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: DAYSAVAILABILITY_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
		window.scrollTo(0, 0);
	}

	window.scrollTo(0, 0);
	dispatch(updateLoadingSpinner(false));
};

export const enableDate = (date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.delete(`/day/${date}`);

		dispatch({
			type: DAY_ENABLED,
			payload: res.data,
		});

		dispatch(setAlert('Date successfully enabled', 'success', '1'));
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: DAYSAVAILABILITY_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
		window.scrollTo(0, 0);
	}

	window.scrollTo(0, 0);
	dispatch(updateLoadingSpinner(false));
};

export const clearDaysAvailability = () => (dispatch) => {
	dispatch({ type: DAYSAVAILABILITY_CLEARED });
};
