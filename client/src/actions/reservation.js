import api from '../utils/api';

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
	let error = false;

	try {
		const res = await api.get(`/reservation/${reservation_id}`);
		dispatch({
			type: RESERVATION_LOADED,
			payload: res.data,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setReservationError(RESERVATION_ERROR, err.response));
			window.scrollTo(0, 0);
		} else error = true;
	}

	if (!error) dispatch(updateLoadingSpinner(false));
};

export const loadReservations = (filterData, bulkLoad) => async (dispatch) => {
	if (!bulkLoad) dispatch(updateLoadingSpinner(true));
	if (bulkLoad) await dispatch(updateStatus());
	let error = false;

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
		if (err.response.status !== 401) {
			dispatch(setReservationError(RESERVATIONS_ERROR, err.response));
		} else error = true;
	}

	if (!error) dispatch(updateLoadingSpinner(false));
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
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch(setReservationError(PAYMENT_ERROR, err.response));
			dispatch(updateLoadingSpinner(false));
		}
	}
};

export const updatePayment = (reservation_id, formData) => async (dispatch) => {
	try {
		const res = await api.post(
			`/reservation/payment/${reservation_id}`,
			formData
		);

		dispatch({
			type: PAYMENT_STATUS_UPDATED,
			payload: res.data,
		});

		return true;
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch(setReservationError(PAYMENT_ERROR, err.response));
		}
		return false;
	}
};

export const updateStatus = () => async (dispatch) => {
	try {
		await api.post('/reservation/status/update');

		dispatch({
			type: PAYMENT_STATUS_UPDATED,
		});
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '2'));
			dispatch(setReservationError(PAYMENT_ERROR, err.response));
		}
	}
};

export const registerReservation = (formData) => async (dispatch) => {
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

		dispatch(setAlert('Reservation Registered', 'success', '1'));
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
		return true;
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setReservationError(RESERVATION_ERROR, err.response));

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

export const updateReservation = (formData) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));

	let reservation = {};
	for (const prop in formData)
		if (formData[prop] !== '') reservation[prop] = formData[prop];
	try {
		let res = await api.post(`/reservation/${formData.id}`, reservation);

		dispatch({
			type: RESERVATION_UPDATED,
			payload: res.data,
		});

		dispatch(setAlert('Reservation Updated', 'success', '1'));
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
		return true;
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setReservationError(RESERVATION_ERROR, err.response));

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
		if (err.response.status !== 401) {
			dispatch(setReservationError(RESERVATION_ERROR, err.response));

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

export const cancelReservation =
	(reservation, formData) => async (dispatch) => {
		dispatch(updateLoadingSpinner(true));

		let data = {};
		for (const prop in formData)
			if (formData[prop] !== '') data[prop] = formData[prop];

		try {
			const res = await api.post(`/reservation/cancel/${reservation.id}`, data);

			dispatch({
				type:
					formData.amount && reservation.total !== formData.amount
						? RESERVATION_UPDATED
						: RESERVATION_CANCELED,
				payload: res.data,
			});

			dispatch(
				setAlert(
					`Reservation ${
						formData.amount && reservation.total !== formData.amount
							? 'Updated'
							: 'Canceled'
					}`,
					'success',
					'1'
				)
			);
			window.scrollTo(0, 0);
			dispatch(updateLoadingSpinner(false));
			return true;
		} catch (err) {
			if (err.response.status !== 401) {
				dispatch(setAlert(err.response.data.msg, 'danger', '2'));
				dispatch(setReservationError(RESERVATION_ERROR, err.response));
				window.scrollTo(0, 0);
				dispatch(updateLoadingSpinner(false));
			}
			return false;
		}
	};
export const deleteReservation = (reservation, date) => async (dispatch) => {
	dispatch(updateLoadingSpinner(true));
	let error = false;

	try {
		await api.post(`/reservation/delete/${reservation.id}`);

		dispatch({
			type: RESERVATION_DELETED,
			payload: reservation.id,
		});

		const isReservation = reservation.status !== 'hourRange';

		if (date) dispatch(deleteDate(date, isReservation));

		dispatch(setAlert('Reservation Deleted', 'success', '1'));
	} catch (err) {
		if (err.response.status !== 401) {
			dispatch(setAlert(err.response.data.msg, 'danger', '1'));
			dispatch(setReservationError(RESERVATION_ERROR, err.response));
		} else error = true;
	}

	if (!error) {
		window.scrollTo(0, 0);
		dispatch(updateLoadingSpinner(false));
	}
};

export const clearReservation = () => (dispatch) => {
	dispatch({ type: RESERVATION_CLEARED });
};

export const clearReservations = () => (dispatch) => {
	dispatch({ type: RESERVATIONS_CLEARED });
};

const setReservationError = (type, response) => (dispatch) => {
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
