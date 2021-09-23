import {
	DAYAVAILABILITY_LOADED,
	MONTHAVAILABILITY_LOADED,
	DAY_DISABLED,
	DAY_ENABLED,
	DAYSAVAILABILITY_CLEARED,
	DAYSAVAILABILITY_ERROR,
} from '../actions/types';

const initialState = {
	loadingAvailableHours: true,
	loadingDisabledDays: true,
	availableHours: [],
	disabledDays: [],
	error: {},
};

const userReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MONTHAVAILABILITY_LOADED:
			return {
				...state,
				loadingDisabledDays: false,
				disabledDays: payload,
				error: {},
			};
		case DAYAVAILABILITY_LOADED:
			return {
				...state,
				loadingAvailableHours: false,
				availableHours: payload,
				error: {},
			};
		case DAYSAVAILABILITY_CLEARED:
			return initialState;
		case DAYSAVAILABILITY_ERROR:
			return {
				...state,
				availableHours: [],
				disabledDays: [],
				loadingAvailableHours: false,
				loadingDisabledDays: false,
				error: payload,
			};
		case DAY_ENABLED:
		case DAY_DISABLED:
			return state;
		default:
			return state;
	}
};

export default userReducer;
