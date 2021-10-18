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
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';
import { clearReservations } from './reservation';

export const loadUser = (user_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	try {
		const res = await api.get(`/user/${user_id}`);
		dispatch({
			type: USER_LOADED,
			payload: res.data,
		});
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: USERS_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
	}
	dispatch(updateLoadingSpinner(false));
};

export const loadUsers = (filterData, search) => async (dispatch) => {
	if (!search) dispatch(updateLoadingSpinner(true));

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
		const res = await api.get(`/user?${filter}`);

		dispatch({
			type: USERS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (
			!search ||
			(err.response.status === 401 &&
				err.response.data.msg !== 'Unauthorized User')
		)
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: USERS_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
		if (!search) window.scrollTo(0, 0);
	}

	if (!search) dispatch(updateLoadingSpinner(false));
};

export const updateUser = (formData, user_id, self) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	let user = {};
	for (const prop in formData)
		if (formData[prop] !== '') user[prop] = formData[prop];

	try {
		const res = await api.put(`/user/${user_id}`, user);

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
		if (err.response.data.errors) {
			const errors = err.response.data.errors;
			errors.forEach((error) => {
				dispatch(setAlert(error.msg, 'danger', '1'));
			});
			dispatch({
				type: USERS_ERROR,
				payload: errors,
			});
		} else {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch({
				type: USERS_ERROR,
				payload: {
					type: err.response.statusText,
					status: err.response.status,
					msg: err.response.data.msg,
				},
			});
		}
	}

	window.scrollTo(0, 0);
	dispatch(updateLoadingSpinner(false));
};

export const deleteUser = (user_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		await api.delete(`/user/${user_id}`);

		dispatch({
			type: USER_DELETED,
			payload: user_id,
		});

		dispatch(setAlert('User Deleted', 'success', '1'));
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: USERS_ERROR,
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

export const clearUser = () => (dispatch) => {
	dispatch({ type: USER_CLEARED });
};

export const clearUsers = () => (dispatch) => {
	dispatch({ type: USERS_CLEARED });
};
