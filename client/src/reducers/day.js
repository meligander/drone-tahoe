import {
	DAYAVAILABILITY_LOADED,
	MONTHAVAILABILITY_LOADED,
	DAY_DISABLED,
	DAY_ENABLED,
	DAYSAVAILABILITY_CLEARED,
	DAYSAVAILABILITY_ERROR,
	DAYS_DISABLED,
	ADD_USEDDAY,
	DELETE_USEDDAY,
} from '../actions/types';

const initialState = {
	loadingAvailableHours: true,
	loadingDisabledDays: true,
	availableHours: [],
	disabledDays: [],
	usedDays: [],
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
				...(payload.usedDays && { usedDays: payload.usedDays }),
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
			const enabledDate = new Date(payload);
			const disabledDays = state.disabledDays.filter((item) => {
				const oldDate = new Date(item);

				return oldDate.getTime() !== enabledDate.getTime();
			});
			return {
				...state,
				disabledDays,
			};
		case DAY_DISABLED:
			return {
				...state,
				disabledDays: [...state.disabledDays, payload],
			};
		case DELETE_USEDDAY:
			const toDelete = new Date(payload);
			const usedDays = state.usedDays.filter((item) => {
				const oldDate = new Date(item);

				return oldDate.getTime() !== toDelete.getTime();
			});
			return {
				...state,
				usedDays,
			};
		case ADD_USEDDAY:
			return {
				...state,
				usedDays: [...state.usedDays, payload],
			};
		case DAYS_DISABLED:
			return {
				...state,
				disabledDays: [...state.disabledDays, ...payload],
			};
		default:
			return state;
	}
};

export default userReducer;
