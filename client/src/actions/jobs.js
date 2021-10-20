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
	JOB_DELETION_ERROR,
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';

export const loadJob = (job_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.get(`/job/${job_id}`);

		dispatch({
			type: JOB_LOADED,
			payload: res.data,
		});
	} catch (err) {
		dispatch({
			type: JOBS_ERROR,
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

export const loadJobs = (filterData, bulkLoad) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	let filter = '';
	const filternames = Object.keys(filterData);
	for (let x = 0; x < filternames.length; x++) {
		const name = filternames[x];
		if (filterData[name] !== '') {
			if (filter !== '') filter = filter + '&';
			filter = filter + filternames[x] + '=' + filterData[name];
		}
	}

	try {
		const res = await api.get(`/job?${filter}`);

		dispatch({
			type: JOBS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (
			err.response.status === 401 &&
			err.response.data.msg !== 'Unauthorized User'
		) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			window.scrollTo(0, 0);
		}
		dispatch({
			type: JOBS_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
	}

	if (!bulkLoad) dispatch(updateLoadingSpinner(false));
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
		if (err.response.data.errors) {
			const errors = err.response.data.errors;
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, 'danger', '2'));
			});
			dispatch({
				type: JOBS_ERROR,
				payload: errors,
			});
		} else {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch({
				type: JOBS_ERROR,
				payload: {
					type: err.response.statusText,
					status: err.response.status,
					msg: err.response.data.msg,
				},
			});
		}
		dispatch(updateLoadingSpinner(false));
		return false;
	}
};

export const deleteJob = (job_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		await api.delete(`/job/${job_id}`);

		dispatch({
			type: JOB_DELETED,
			payload: job_id,
		});

		dispatch(setAlert('Job Deleted', 'success', '1'));
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: JOB_DELETION_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
	}
	window.scrollTo(0, 0);
	dispatch(updateLoadingSpinner(false));
};

export const clearJobs = () => (dispatch) => {
	dispatch({ type: JOBS_CLEARED });
};

export const clearJob = () => (dispatch) => {
	dispatch({ type: JOB_CLEARED });
};
