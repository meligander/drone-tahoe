import api from '../utils/api';

import {
	JOBSXRESERVATIONS_CLEARED,
	JOBSXRESERVATIONS_ERROR,
	JOBSXRESERVATIONS_LOADED,
} from './types';

import { updateLoadingSpinner } from './global';

export const loadUserJobs = (user_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.get(`/res/job/user/${user_id}`);

		dispatch({
			type: JOBSXRESERVATIONS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		dispatch(setJobsXReservationError(JOBSXRESERVATIONS_ERROR, err.response));
		window.scrollTo(0, 0);
	}

	dispatch(updateLoadingSpinner(false));
};

export const loadReservationJobs =
	(reservation_id, type) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));
		try {
			const res = await api.get(
				`/res/job/reservation/${reservation_id}${type ? '?type=' + type : ''}`
			);

			dispatch({
				type: JOBSXRESERVATIONS_LOADED,
				payload: res.data,
			});
		} catch (err) {
			dispatch(setJobsXReservationError(JOBSXRESERVATIONS_ERROR, err.response));
		}

		dispatch(updateLoadingSpinner(false));
	};

export const loadJobUsers = (jobs) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	try {
		const res = await api.get(`/res/job/jobs/${jobs.map((item) => item)}`);

		dispatch({
			type: JOBSXRESERVATIONS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		dispatch(setJobsXReservationError(JOBSXRESERVATIONS_ERROR, err.response));
	}

	dispatch(updateLoadingSpinner(false));
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
