import api from '../utils/api';
import history from '../utils/history';

import {
	RESERVATIONS_CLEARED,
	RESERVATIONS_ERROR,
	RESERVATIONS_LOADED,
	RESERVATION_DELETED,
	RESERVATION_LOADED,
	RESERVATION_REGISTERED,
	RESERVATION_UPDATED,
	RESERVATION_CLEARED,
	ADD_USEDDAY,
	DELETE_USEDDAY,
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';

export const loadReservation = (reservation_id) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.get(`/reservation/${reservation_id}`);
		dispatch({
			type: RESERVATION_LOADED,
			payload: res.data,
		});
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: RESERVATIONS_ERROR,
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

export const loadReservations = (filterData, bulkLoad) => async (dispatch) => {
	if (!bulkLoad) dispatch(updateLoadingSpinner(true));

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
		const res = await api.get(`/reservation?${filter}`);

		dispatch({
			type: RESERVATIONS_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (
			!bulkLoad ||
			(err.response.status === 401 &&
				err.response.data.msg !== 'Unauthorized User')
		)
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: RESERVATIONS_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
		if (!bulkLoad) window.scrollTo(0, 0);
	}

	dispatch(updateLoadingSpinner(false));
};

export const registerReservation =
	(formData, admin, date) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));
		if (formData.user === '') {
			history.push('/login');
			dispatch(
				setAlert(
					'You must login or signup before making a reservation',
					'danger',
					'1'
				)
			);
		} else {
			try {
				let res = await api.post('/reservation', formData);

				dispatch({
					type: RESERVATION_REGISTERED,
					payload: res.data,
				});

				if (date)
					dispatch({
						type: ADD_USEDDAY,
						payload: date,
					});

				if (admin) history.push('/reservations-list/');
				dispatch(setAlert('Reservation Registered', 'success', '1'));
				window.scrollTo(0, 0);
			} catch (err) {
				if (err.response.data.errors) {
					const errors = err.response.data.errors;
					errors.forEach((error) => {
						dispatch(setAlert(error.msg, 'danger', '2'));
					});
					dispatch({
						type: RESERVATIONS_ERROR,
						payload: errors,
					});
				} else {
					dispatch(setAlert(err.response.data.msg, 'danger', '2'));
					dispatch({
						type: RESERVATIONS_ERROR,
						payload: {
							type: err.response.statusText,
							status: err.response.status,
							msg: err.response.data.msg,
						},
					});
				}
			}
		}

		dispatch(updateLoadingSpinner(false));
	};

export const updateReservation =
	(formData, reservation_id, type) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));
		try {
			let res = await api.put(`/reservation/${reservation_id}`, formData);

			dispatch({
				type: RESERVATION_UPDATED,
				payload: res.data,
			});

			if (type === 'admin') history.push('/reservations-list');

			dispatch(setAlert('Reservation Updated', 'success', '1'));
			window.scrollTo(0, 0);
		} catch (err) {
			if (err.response.data.errors) {
				const errors = err.response.data.errors;
				errors.forEach((error) => {
					dispatch(setAlert(error.msg, 'danger', '2'));
				});
				dispatch({
					type: RESERVATIONS_ERROR,
					payload: errors,
				});
			} else {
				dispatch(setAlert(err.response.data.msg, 'danger', '2'));
				dispatch({
					type: RESERVATIONS_ERROR,
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

export const deleteReservation = (reservation_id, date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		await api.delete(`/reservation/${reservation_id}`);

		dispatch({
			type: RESERVATION_DELETED,
			payload: reservation_id,
		});

		if (date)
			dispatch({
				type: DELETE_USEDDAY,
				payload: date,
			});

		dispatch(setAlert('Reservation Deleted', 'success', '1'));
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: RESERVATIONS_ERROR,
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

export const clearReservation = () => (dispatch) => {
	dispatch({ type: RESERVATION_CLEARED });
};

export const clearReservations = () => (dispatch) => {
	dispatch({ type: RESERVATIONS_CLEARED });
};
