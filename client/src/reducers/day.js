import {
	DAYAVAILABILITY_LOADED,
	MONTHAVAILABILITY_LOADED,
	DAY_DISABLED,
	DAY_ENABLED,
	DAYSAVAILABILITY_CLEARED,
	DAYSAVAILABILITY_ERROR,
	DAYS_DISABLED,
	DELETE_RESERVED_DAY,
	ADD_RESERVED_DAY,
	ADD_TIME_DISABLED_DAY,
	DELETE_TIME_DISABLED_DAY,
} from '../actions/types';

const initialState = {
	loadingAvailableHours: true,
	loadingDisabledDays: true,
	availableHours: [],
	disabledDays: [],
	reservedDays: [],
	timeDisabledDays: [],
	error: {},
};

const userReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case MONTHAVAILABILITY_LOADED:
			return {
				...state,
				loadingDisabledDays: false,
				disabledDays: payload.disabledDays ? payload.disabledDays : payload,
				...(payload.reservedDays && { reservedDays: payload.reservedDays }),
				...(payload.timeDisabledDays && {
					timeDisabledDays: payload.timeDisabledDays,
				}),
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
				loadingAvailableHours: false,
				error: payload,
			};
		case DAY_ENABLED:
		case DELETE_RESERVED_DAY:
		case DELETE_TIME_DISABLED_DAY:
			const toDelete = new Date(payload.date);
			const daysArray = state[payload.type].filter((item) => {
				const oldDate = new Date(item);
				return oldDate.getTime() !== toDelete.getTime();
			});
			return {
				...state,
				[payload.type]: daysArray,
			};
		case DAY_DISABLED:
		case ADD_RESERVED_DAY:
		case ADD_TIME_DISABLED_DAY:
		case DAYS_DISABLED:
			return {
				...state,
				[payload.type]: payload.dates
					? [...state[payload.type], ...payload.dates]
					: [...state[payload.type], payload.date],
			};
		default:
			return state;
	}
};

export default userReducer;
