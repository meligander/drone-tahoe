import api from '../utils/api';

import {
	JOBSXRESERVATIONS_CLEARED,
	JOBSXRESERVATIONS_ERROR,
	JOBSXRESERVATIONS_LOADED,
} from './types';

import { updateLoadingSpinner } from './global';

export const loadUserJobs = (user_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		const res = await api.get(`/res/job/user/${user_id}`);

		dispatch({
			type: JOBSXRESERVATIONS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setJobsXReservationError(JOBSXRESERVATIONS_ERROR, err.response));
			window.scrollTo(0, 0);
		} else error = true;
	}

	if (!error) dispatch(updateLoadingSpinner(false));
};

export const loadReservationJobs =
	(reservation_id, type) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));
		let error = false;

		try {
			const res = await api.get(
				`/res/job/reservation/${reservation_id}&${type ? '?type=' + type : ''}`
			);

			dispatch({
				type: JOBSXRESERVATIONS_LOADED,
				payload: res.data,
			});
		} catch (err) {
			if (err.response.status !== 401) {
				dispatch(
					setJobsXReservationError(JOBSXRESERVATIONS_ERROR, err.response)
				);
			} else error = true;
		}

		if (!error) dispatch(updateLoadingSpinner(false));
	};

export const loadJobUsers = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	let filter = '';
	for (const x in formData) {
		if (
			(x === 'jobs' && formData[x].length > 0) ||
			(formData[x] !== '' && x !== 'jobs')
		)
			filter = `${filter !== '' ? `${filter}&` : ''}${x}=${
				x === 'jobs' ? formData[x].map((item) => item) : formData[x]
			}`;
	}

	try {
		const res = await api.get(`/res/job/jobs?${filter}`);

		dispatch({
			type: JOBSXRESERVATIONS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setJobsXReservationError(JOBSXRESERVATIONS_ERROR, err.response));
		} else error = true;
	}

	if (!error) dispatch(updateLoadingSpinner(false));
};

export const clearJobsXReservations = () => (dispatch) => {
	dispatch({ type: JOBSXRESERVATIONS_CLEARED });
};

const setJobsXReservationError = (type, response) => (dispatch) => {
	dispatch({
		type: type,
		payload: {
			type: response.statusText,
			status: response.status,
			msg: response.data.msg,
		},
	});
};
