import {
	FOOTER_HEIGHT_SETTED,
	LOADINGSPINNER_UPDATED,
	NAVBAR_HEIGHT_SETTED,
} from '../actions/types';

const initialState = {
	loadingSpinner: false,
	footer: 0,
	navbar: 0,
};

const globalReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case LOADINGSPINNER_UPDATED:
			return {
				...state,
				loadingSpinner: payload,
			};
		case NAVBAR_HEIGHT_SETTED:
			return {
				...state,
				navbar: payload,
			};
		case FOOTER_HEIGHT_SETTED:
			return {
				...state,
				footer: payload,
			};
		default:
			return state;
	}
};

export default globalReducer;
