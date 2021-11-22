import api from '../utils/api';

import {
	DAYAVAILABILITY_LOADED,
	MONTHAVAILABILITY_LOADED,
	DAY_DISABLED,
	DAY_ENABLED,
	DAYSAVAILABILITY_ERROR,
	DAYSAVAILABILITY_CLEARED,
	DAYS_DISABLED,
	ADD_RESERVED_DAY,
	ADD_TIME_DISABLED_DAY,
	DELETE_RESERVED_DAY,
	DELETE_TIME_DISABLED_DAY,
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';

export const checkDayAvailability =
	(date, reservation_id, diff) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));
		let error = false;

		try {
			const res = await api.get(`/day/${date}/${reservation_id}/${diff}`);
			dispatch({
				type: DAYAVAILABILITY_LOADED,
				payload: res.data,
			});
		} catch (err) {
			if (err.response.status !== 401) {
				dispatch(setAlert(err.response.data.msg, 'danger', '1'));
				dispatch(setDaysError(DAYSAVAILABILITY_ERROR, err.response));
				window.scrollTo(0, 0);
			} else error = true;
		}

		if (!error) dispatch(updateLoadingSpinner(false));
	};

export const checkMonthAvailability =
	(month, year, reservation_id, diff) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));
		let error = false;

		try {
			const res = await api.get(
				`/day/${month}/${year}/${reservation_id}/${diff}`
			);

			dispatch({
				type: MONTHAVAILABILITY_LOADED,
				payload: res.data,
			});
		} catch (err) {
			if (err.response.status !== 401) {
				dispatch(setAlert(err.response.data.msg, 'danger', '1'));
				dispatch(setDaysError(DAYSAVAILABILITY_ERROR, err.response));
				window.scrollTo(0, 0);
			} else error = true;
		}

		if (!error) dispatch(updateLoadingSpinner(false));
	};

export const checkMonthSchedule = (month, year) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		const res = await api.get(`/day/schedule/${month}/${year}`);

		dispatch({
			type: MONTHAVAILABILITY_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setDaysError(DAYSAVAILABILITY_ERROR, err.response));
			window.scrollTo(0, 0);
		}
		error = true;
	}

	if (!error) dispatch(updateLoadingSpinner(false));
};

export const disableDate = (date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		await api.post(`/day/${date}`);

		dispatch({
			type: DAY_DISABLED,
			payload: {
				type: 'disabledDays',
				date,
			},
		});

		dispatch(setAlert('Date successfully disabled', 'success', '2'));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch(setDaysError(DAYSAVAILABILITY_ERROR, err.response));
			window.scrollTo(0, 0);
		}
		error = true;
	}
	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const disableDateRange = (dateFrom, dateTo) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		const res = await api.post(`/day/${dateFrom}/${dateTo}`);

		dispatch({
			type: DAYS_DISABLED,
			payload: {
				type: 'disabledDays',
				dates: res.data,
			},
		});

		dispatch(setAlert('Dates successfully disabled', 'success', '2'));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch(setDaysError(DAYSAVAILABILITY_ERROR, err.response));
			window.scrollTo(0, 0);
		}
		error = true;
	}
	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const enableDate = (date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		await api.post(`/day/delete/${date}`);

		dispatch({
			type: DAY_ENABLED,
			payload: {
				type: 'disabledDays',
				date,
			},
		});

		dispatch(setAlert('Date successfully enabled', 'success', '2'));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch(setDaysError(DAYSAVAILABILITY_ERROR, err.response));
			window.scrollTo(0, 0);
		} else error = true;
	}

	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const addDate = (date, reservation) => async (dispatch) => {
	dispatch({
		type: reservation ? ADD_RESERVED_DAY : ADD_TIME_DISABLED_DAY,
		payload: {
			type: reservation ? 'reservedDays' : 'timeDisabledDays',
			date,
		},
	});
};

export const deleteDate = (date, reservation) => async (dispatch) => {
	dispatch({
		type: reservation ? DELETE_RESERVED_DAY : DELETE_TIME_DISABLED_DAY,
		payload: {
			type: reservation ? 'reservedDays' : 'timeDisabledDays',
			date,
		},
	});
};

export const clearDaysAvailability = () => (dispatch) => {
	dispatch({ type: DAYSAVAILABILITY_CLEARED });
};

const setDaysError = (type, response) => (dispatch) => {
	dispatch({
		type: type,
		payload: {
			type: response.statusText,
			status: response.status,
			msg: response.data.msg,
		},
	});
};
