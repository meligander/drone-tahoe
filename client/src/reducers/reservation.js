import {
	RESERVATION_LOADED,
	RESERVATIONS_LOADED,
	RESERVATION_REGISTERED,
	RESERVATION_UPDATED,
	RESERVATION_DELETED,
	RESERVATIONS_ERROR,
	RESERVATION_CLEARED,
	RESERVATIONS_CLEARED,
} from '../actions/types';

const initialState = {
	loading: true,
	loadingReservation: true,
	reservation: null,
	reservations: [],
	error: {},
};

const reservationReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case RESERVATION_LOADED:
			return {
				...state,
				loadingReservation: false,
				reservation: payload,
				error: {},
			};
		case RESERVATIONS_LOADED:
			return {
				...state,
				loading: false,
				reservations: payload,
				error: {},
			};
		case RESERVATION_REGISTERED:
			return {
				...state,
				loading: false,
				reservations: [...state.reservations, payload],
				error: {},
			};
		case RESERVATION_UPDATED:
			return {
				...state,
				loadingReservation: false,
				reservations: state.reservations.map((item) =>
					item.id === payload.id ? payload : item
				),
				error: {},
			};
		case RESERVATION_DELETED:
			return {
				...state,
				reservations: state.reservations.filter(
					(reservation) => reservation.id !== payload
				),
				loading: false,
				error: {},
			};
		case RESERVATIONS_CLEARED:
			return initialState;
		case RESERVATION_CLEARED:
			return {
				...state,
				loadingReservation: true,
				reservation: null,
				error: {},
			};
		case RESERVATIONS_ERROR:
			return {
				...state,
				//reservation: null,
				reservations: [],
				loadingReservation: false,
				loading: false,
				error: payload,
			};
		default:
			return state;
	}
};

export default reservationReducer;
