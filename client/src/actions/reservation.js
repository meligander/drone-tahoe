import api from '../utils/api';
//import history from '../utils/history';

import {
	RESERVATIONS_CLEARED,
	RESERVATIONS_ERROR,
	RESERVATIONS_LOADED,
	RESERVATION_CANCELED,
	RESERVATION_DELETED,
	RESERVATION_LOADED,
	RESERVATION_REGISTERED,
	RESERVATION_UPDATED,
	RESERVATION_CLEARED,
	PAYMENT_ERROR,
	PAYMENT_SUCCESSFUL,
	PAYMENT_STATUS_UPDATED,
	RESERVATION_ERROR,
} from './types';

import { setAlert } from './alert';
import { updateLoadingSpinner } from './global';
import { addDate, deleteDate } from './day';

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
			type: RESERVATION_ERROR,
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

	if (bulkLoad) await dispatch(updateStatus());

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
			err.response.status === 401 &&
			err.response.data.msg !== 'Unauthorized User'
		) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			window.scrollTo(0, 0);
		}
		dispatch({
			type: RESERVATIONS_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
	}

	dispatch(updateLoadingSpinner(false));
};

export const makePayment = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	try {
		const res = await api.post('/reservation/payment', formData);

		dispatch({
			type: PAYMENT_SUCCESSFUL,
		});

		dispatch(updateLoadingSpinner(false));
		return res.data;
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '2'));
		dispatch({
			type: PAYMENT_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
		dispatch(updateLoadingSpinner(false));
	}
};

export const updatePayment = (reservation_id, formData) => async (dispatch) => {
	try {
		const res = await api.put(
			`/reservation/payment/${reservation_id}`,
			formData
		);

		dispatch({
			type: PAYMENT_STATUS_UPDATED,
			payload: res.data,
		});

		return true;
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '2'));
		dispatch({
			type: PAYMENT_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
		return false;
	}
};

export const updateStatus = () => async (dispatch) => {
	try {
		await api.put('/reservation/status/update');

		dispatch({
			type: PAYMENT_STATUS_UPDATED,
		});
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '2'));
		dispatch({
			type: PAYMENT_ERROR,
			payload: {
				type: err.response.statusText,
				status: err.response.status,
				msg: err.response.data.msg,
			},
		});
	}
};

export const registerReservation = (formData, date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	let reservation = {};
	for (const prop in formData)
		if (formData[prop] !== '') reservation[prop] = formData[prop];

	try {
		let res = await api.post('/reservation', reservation);

		dispatch({
			type: RESERVATION_REGISTERED,
			payload: res.data,
		});

		if (date) dispatch(addDate(date, true));

		dispatch(setAlert('Reservation Registered', 'success', '1'));
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
				type: RESERVATION_ERROR,
				payload: errors,
			});
		} else {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch({
				type: RESERVATION_ERROR,
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

export const updateReservation =
	(formData, newDate, oldDate, remove) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));

		let reservation = {};
		for (const prop in formData)
			if (formData[prop] !== '') reservation[prop] = formData[prop];
		try {
			let res = await api.put(`/reservation/${formData.id}`, reservation);

			dispatch({
				type: remove ? RESERVATION_DELETED : RESERVATION_UPDATED,
				payload: remove ? formData.id : res.data,
			});

			if (newDate) dispatch(addDate(newDate, true));
			if (oldDate) dispatch(deleteDate(oldDate, true));

			dispatch(setAlert('Reservation Updated', 'success', '1'));
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
					type: RESERVATION_ERROR,
					payload: errors,
				});
			} else {
				dispatch(setAlert(err.response.data.msg, 'danger', '2'));
				dispatch({
					type: RESERVATION_ERROR,
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

export const disableHourRange = (formData, date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	let hourRange = {};
	for (const prop in formData)
		if (formData[prop] !== '') hourRange[prop] = formData[prop];

	try {
		let res = await api.post('/reservation/disable', hourRange);

		dispatch({
			type: RESERVATION_REGISTERED,
			payload: res.data,
		});

		dispatch(addDate(date, false));

		dispatch(setAlert('Time Range Disabled', 'success', '1'));
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
				type: RESERVATION_ERROR,
				payload: errors,
			});
		} else {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch({
				type: RESERVATION_ERROR,
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

export const cancelReservation = (reservation) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		const res = await api.put(`/reservation/cancel/${reservation.id}`);

		dispatch({
			type: !reservation.paymentId ? RESERVATION_DELETED : RESERVATION_CANCELED,
			payload: res.data,
		});

		dispatch(
			setAlert(
				`Reservation ${!reservation.paymentId ? 'Deleted' : 'Canceled'}`,
				'success',
				'1'
			)
		);
	} catch (err) {
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: RESERVATION_ERROR,
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
export const deleteReservation = (reservation, date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	try {
		await api.delete(`/reservation/${reservation.id}`);

		dispatch({
			type: RESERVATION_DELETED,
			payload: reservation.id,
		});

		const isReservation = reservation.status !== 'hourRange';

		if (date) dispatch(deleteDate(date, isReservation));

		dispatch(
			setAlert(
				isReservation ? 'Reservation Deleted' : 'Time Range Enabled',
				'success',
				'1'
			)
		);
	} catch (err) {
		console.log(err);
		dispatch(setAlert(err.response.data.msg, 'danger', '1'));
		dispatch({
			type: RESERVATION_ERROR,
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
