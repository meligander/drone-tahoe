import api from '../utils/api';
import history from '../utils/history';

import {
	USER_LOADED,
	USERAUTH_LOADED,
	USERS_LOADED,
	USER_UPDATED,
	USER_DELETED,
	USERS_ERROR,
	USER_CLEARED,
	USERS_CLEARED,
	USER_ERROR,
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';
import { clearReservations } from './reservation';

export const loadUser = (user_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		const res = await api.get(`/user/${user_id}`);
		dispatch({
			type: USER_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setUserError(USER_ERROR, err.response));
		} else error = true;
	}

	if (!error) dispatch(updateLoadingSpinner(false));
};

export const loadUsers = (formData, search) => async (dispatch) => {
	if (!search) dispatch(updateLoadingSpinner(true));
	let error = false;

	let filter = '';
	for (const x in formData) {
		if (formData[x] !== '')
			filter = `${filter !== '' ? `${filter}&` : ''}${x}=${formData[x]}`;
	}

	try {
		const res = await api.get(`/user?${filter}`);

		dispatch({
			type: USERS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setUserError(USERS_ERROR, err.response));
		} else error = true;
	}

	if (!search && !error) dispatch(updateLoadingSpinner(false));
};

export const updateUser = (formData, self) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	let user = {};
	for (const prop in formData)
		if (formData[prop] !== '') user[prop] = formData[prop];

	try {
		console.log(formData);
		const res = await api.post(`/user/${formData.id}`, user);
		console.log(res);

		dispatch({
			type: self ? USERAUTH_LOADED : USER_UPDATED,
			payload: res.data,
		});

		dispatch(
			setAlert(
				`${self ? 'Profile' : 'User'} Successfully Updated`,
				'success',
				'1'
			)
		);
		if (!self) {
			dispatch(clearReservations());
			history.goBack();
		}
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setUserError(USER_ERROR, err.response));

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

export const deleteUser = (user_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		await api.delete(`/user/${user_id}`);

		dispatch({
			type: USER_DELETED,
			payload: user_id,
		});

		dispatch(setAlert('User Deleted', 'success', '1'));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setUserError(USER_ERROR, err.response));
		} else error = true;
	}

	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const clearUser = () => (dispatch) => {
	dispatch({ type: USER_CLEARED });
};

export const clearUsers = () => (dispatch) => {
	dispatch({ type: USERS_CLEARED });
};

const setUserError = (type, response) => (dispatch) => {
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
