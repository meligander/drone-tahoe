import api from '../utils/api';

import {
	JOB_LOADED,
	JOBS_LOADED,
	JOB_REGISTERED,
	JOB_UPDATED,
	JOB_DELETED,
	JOBS_ERROR,
	JOBS_CLEARED,
	JOB_CLEARED,
	JOB_ERROR,
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';

export const loadJob = (job_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		const res = await api.get(`/job/${job_id}`);

		dispatch({
			type: JOB_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setJobsError(JOB_ERROR, err.response));
			window.scrollTo(0, 0);
		} else error = true;
	}

	if (!error) dispatch(updateLoadingSpinner(false));
};

export const loadJobs = (formData, bulkLoad) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	let filter = '';
	for (const x in formData) {
		if (formData[x] !== '')
			filter = `${filter !== '' ? `${filter}&` : ''}${x}=${formData[x]}`;
	}

	try {
		const res = await api.get(`/job?${filter}`);

		dispatch({
			type: JOBS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setJobsError(JOBS_ERROR, err.response));
		} else error = true;
	}

	if (!bulkLoad && !error) dispatch(updateLoadingSpinner(false));
};

export const registerUpdateJob = (formData, job_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	let job = {};
	for (const prop in formData)
		if (formData[prop] !== '') job[prop] = formData[prop];

	try {
		const res = await api.post(`/job/${job_id ? job_id : '0'}`, job);

		dispatch({
			type: job_id ? JOB_UPDATED : JOB_REGISTERED,
			payload: res.data,
		});

		dispatch(
			setAlert(`Job ${job_id ? 'Updated' : 'Registered'}`, 'success', '1')
		);
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
		return true;
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setJobsError(JOB_ERROR, err.response));
			if (err.response.data.errors)
				err.response.data.errors.forEach((error) => {
					dispatch(setAlert(error.msg, 'danger', '2'));
				});
			else dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch(updateLoadingSpinner(false));
		}
		return false;
	}
};

export const deleteJob = (job_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		await api.post(`/job/delete/${job_id}`);

		dispatch({
			type: JOB_DELETED,
			payload: job_id,
		});

		dispatch(setAlert('Job Deleted', 'success', '1'));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setJobsError(JOB_ERROR, err.response));
		} else error = true;
	}
	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const clearJobs = () => (dispatch) => {
	dispatch({ type: JOBS_CLEARED });
};

export const clearJob = () => (dispatch) => {
	dispatch({ type: JOB_CLEARED });
};

const setJobsError = (type, response) => (dispatch) => {
	dispatch({
		type: type,
		payload: response.data.errors
			? response.data.errors
			: {
					type: response.statusText,
					status: response.status,
					msg: response.data.msg,
			  },
	});
};
