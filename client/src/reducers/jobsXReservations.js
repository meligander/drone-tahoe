import {
	JOBSXRESERVATIONS_CLEARED,
	JOBSXRESERVATIONS_ERROR,
	JOBSXRESERVATIONS_LOADED,
} from '../actions/types';

const initialState = {
	loading: true,
	jobsXreservations: [],
	error: {},
};

const reservationReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case JOBSXRESERVATIONS_LOADED:
			return {
				...state,
				loading: false,
				jobsXreservations: payload,
				error: {},
			};
		case JOBSXRESERVATIONS_CLEARED:
			return initialState;
		case JOBSXRESERVATIONS_ERROR:
			return {
				...state,
				jobsXreservations: [],
				loading: false,
				error: payload,
			};
		default:
			return state;
	}
};

export default reservationReducer;
