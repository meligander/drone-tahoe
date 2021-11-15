import api from '../utils/api';
import history from '../utils/history';

import {
	AUTH_ERROR,
	LOGIN_FAIL,
	LOGIN_SUCCESS,
	LOGOUT,
	EMAIL_SENT,
	USERAUTH_LOADED,
	SIGNUP_FAIL,
	SIGNUP_SUCCESS,
	PASSWORD_CHANGED,
	EMAIL_ERROR,
	EMAIL_CLEARED,
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';
import { clearReservations } from './reservation';
import { clearJobs } from './jobs';

export const loadUser = (login) => async (dispatch) => {
	try {
		const res = await api.get('/user/info');
		dispatch({
			type: USERAUTH_LOADED,
			payload: res.data,
		});

		if (login) {
			if (res.data.type === 'admin') {
				dispatch(clearReservations());
				dispatch(clearJobs());
				history.push('/reservations-list');
			} else {
				history.push('/');
				dispatch(updateLoadingSpinner(false));
			}
		}
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setAuthError(AUTH_ERROR, err.response));
			dispatch(updateLoadingSpinner(false));
		}
	}
};

export const loginUser = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	let user = {};
	for (const prop in formData)
		if (formData[prop] !== '') user[prop] = formData[prop];

	try {
		const res = await api.post('/auth', user);
		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data,
		});

		dispatch(loadUser(true));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAuthError(LOGIN_FAIL, err.response));

			if (err.response.data.errors)
				err.response.data.errors.forEach((error) => {
					dispatch(setAlert(error.msg, 'danger', '1'));
				});
			else dispatch(setAlert(err.response.msg, 'danger', '1'));
			dispatch(updateLoadingSpinner(false));
		} else error = true;
	}
	if (!error) window.scrollTo(0, 0);
};

export const facebookLogin = (fbkData) => async (dispatch) => {
	let error = false;
	try {
		const res = await api.post('/auth/facebooklogin', fbkData);

		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data,
		});

		dispatch(loadUser(true));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setAuthError(LOGIN_FAIL, err.response));
			dispatch(updateLoadingSpinner(false));
		} else error = true;
	}
	if (!error) window.scrollTo(0, 0);
};

export const googleLogin = (googleData) => async (dispatch) => {
	let error = false;
	try {
		const res = await api.post('/auth/googlelogin', googleData);

		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data,
		});

		dispatch(loadUser(true));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setAuthError(LOGIN_FAIL, err.response));
			dispatch(updateLoadingSpinner(false));
		} else error = true;
	}
	if (!error) window.scrollTo(0, 0);
};

export const signup = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	let user = {};
	for (const prop in formData)
		if (formData[prop] !== '') user[prop] = formData[prop];

	try {
		await api.post('/auth/signup', user);

		dispatch({
			type: EMAIL_SENT,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAuthError(SIGNUP_FAIL, err.response));
			if (err.response.data.errors)
				err.response.data.errors.forEach((error) => {
					dispatch(setAlert(error.msg, 'danger', '1'));
				});
			else dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			window.scrollTo(0, 0);
		} else error = true;
	}

	if (!error) dispatch(updateLoadingSpinner(false));
};

export const sendPasswordLink = (email) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;
	try {
		const res = await api.put('/auth/password', { email });

		dispatch({
			type: EMAIL_SENT,
		});

		dispatch(setAlert(res.data.msg, 'success', '1'));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAuthError(AUTH_ERROR, err.response));
			if (err.response.data.errors)
				err.response.data.errors.forEach((error) => {
					dispatch(setAlert(error.msg, 'danger', '1'));
				});
			else dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		} else error = true;
	}

	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const resetPassword = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	let user = {};
	for (const prop in formData)
		if (formData[prop] !== '') user[prop] = formData[prop];

	try {
		const res = await api.put('/auth/reset-password', user);

		dispatch({
			type: PASSWORD_CHANGED,
			payload: res.data,
		});

		if (res.data.type === 'admin') history.push('/reservations-list');
		else history.push('/');

		dispatch(setAlert('Password successfully changed', 'success', '1'));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAuthError(AUTH_ERROR, err.response));
			if (err.response.data.errors)
				err.response.data.errors.forEach((error) => {
					dispatch(setAlert(error.msg, 'danger', '1'));
				});
			else dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		} else error = true;
	}

	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const activation = (token) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;
	try {
		const res = await api.post('/auth/activation', { token });

		dispatch({
			type: SIGNUP_SUCCESS,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAuthError(SIGNUP_FAIL, err.response));
		}
		error = true;
	}
	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const sendEmail = (formData, outreach, stayDown) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	let data = {};
	for (const prop in formData)
		if (formData[prop] !== '') data[prop] = formData[prop];

	try {
		const res = await api.post(
			outreach ? '/auth/outreach-email' : '/auth/send-email',
			data
		);

		dispatch({
			type: EMAIL_SENT,
		});

		dispatch(setAlert(res.data.msg, 'success', '1'));
		if (!stayDown) window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
		return true;
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAuthError(EMAIL_ERROR, err.response));

			if (err.response.data.errors)
				err.response.data.errors.forEach((error) => {
					dispatch(setAlert(error.msg, 'danger', outreach ? '2' : '1'));
				});
			else
				dispatch(
					setAlert(err.response.data.msg, 'danger', outreach ? '2' : '1')
				);
		}
		dispatch(updateLoadingSpinner(false));
		return false;
	}
};

export const clearEmailSent = () => (dispatch) => {
	dispatch({
		type: EMAIL_CLEARED,
	});
};

export const logOut = () => (dispatch) => {
	dispatch({
		type: LOGOUT,
	});
	history.push('/login');
};

export const setAuthError = (type, response) => (dispatch) => {
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
