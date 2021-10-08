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
			} else history.push('/');

			dispatch(updateLoadingSpinner(false));
		}
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: AUTH_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
		dispatch(updateLoadingSpinner(false));
	}
};

export const loginUser = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	try {
		const res = await api.post('/auth', formData);
		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data,
		});

		dispatch(loadUser(true));
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, 'danger', '1'));
			});
			dispatch({
				type: LOGIN_FAIL,
				payload: errors,
			});
		} else {
			dispatch({
				type: LOGIN_FAIL,
				payload: {
					type: err.response.statusText,
					status: err.response.status,
					msg: err.response.data.msg,
				},
			});
		}
		dispatch(updateLoadingSpinner(false));
	}
	window.scrollTo(0, 0);
};

export const facebookLogin = (fbkData) => async (dispatch) => {
	try {
		const res = await api.post('/auth/facebooklogin', fbkData);

		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data,
		});

		dispatch(loadUser(true));
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: LOGIN_FAIL,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});

		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const googleLogin = (googleData) => async (dispatch) => {
	try {
		const res = await api.post('/auth/googlelogin', googleData);

		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data,
		});

		dispatch(loadUser(true));
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: LOGIN_FAIL,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});

		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const signup = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		if (formData.formImg) await api.post('/user/upload-img', formData.formImg);

		await api.post('/auth/signup', formData);

		dispatch({
			type: EMAIL_SENT,
		});
	} catch (err) {
		if (err.response.data.errors) {
			const errors = err.response.data.errors;
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, 'danger', '1'));
			});
			dispatch({
				type: SIGNUP_FAIL,
				payload: errors,
			});
		} else {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch({
				type: SIGNUP_FAIL,
				payload: {
					type: err.response.statusText,
					status: err.response.status,
					msg: err.response.data.msg,
				},
			});
		}

		window.scrollTo(0, 0);
	}

	dispatch(updateLoadingSpinner(false));
};

export const sendPasswordLink = (email) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.put('/auth/password', { email });

		dispatch({
			type: EMAIL_SENT,
		});

		dispatch(setAlert(res.data.msg, 'success', '1'));
	} catch (err) {
		if (err.response.data.errors) {
			const errors = err.response.data.errors;
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, 'danger', '1'));
			});
			dispatch({
				type: SIGNUP_FAIL,
				payload: errors,
			});
		} else {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch({
				type: SIGNUP_FAIL,
				payload: {
					type: err.response.statusText,
					status: err.response.status,
					msg: err.response.data.msg,
				},
			});
		}

		window.scrollTo(0, 0);
	}

	dispatch(updateLoadingSpinner(false));
};

export const resetPassword = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.put('/auth/reset-password', formData);

		dispatch({
			type: PASSWORD_CHANGED,
			payload: res.data,
		});

		if (res.data.type === 'admin') history.push('/dashboard');
		else history.push('/');

		dispatch(setAlert('Password successfully changed', 'success', '1'));
	} catch (err) {
		if (err.response.data.errors) {
			const errors = err.response.data.errors;
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, 'danger', '1'));
			});
			dispatch({
				type: SIGNUP_FAIL,
				payload: errors,
			});
		} else {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch({
				type: SIGNUP_FAIL,
				payload: {
					type: err.response.statusText,
					status: err.response.status,
					msg: err.response.data.msg,
				},
			});
		}

		window.scrollTo(0, 0);
	}

	dispatch(updateLoadingSpinner(false));
};

export const activation = (token) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.post('/auth/activation', { token });

		dispatch({
			type: SIGNUP_SUCCESS,
			payload: res.data,
		});
	} catch (err) {
		console.log(err);
		dispatch({
			type: SIGNUP_FAIL,
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

export const sendEmail = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.post('/auth/send-email', formData);

		dispatch({
			type: EMAIL_SENT,
		});

		dispatch(setAlert(res.data.msg, 'success', '1'));
	} catch (err) {
		if (err.response.data.errors) {
			const errors = err.response.data.errors;
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, 'danger', '1'));
			});
			dispatch({
				type: EMAIL_ERROR,
				payload: errors,
			});
		} else {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch({
				type: EMAIL_ERROR,
				payload: {
					type: err.response.statusText,
					status: err.response.status,
					msg: err.response.data.msg,
				},
			});
		}
	}

	dispatch(updateLoadingSpinner(false));
};

export const logOut = () => (dispatch) => {
	dispatch({
		type: LOGOUT,
	});
	history.push('/login');
};
