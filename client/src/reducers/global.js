import { LOADINGSPINNER_UPDATED } from '../actions/types';

const initialState = {
	loadingSpinner: false,
};

const globalReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case LOADINGSPINNER_UPDATED:
			return {
				...state,
				loadingSpinner: payload,
			};
		default:
			return state;
	}
};

export default globalReducer;
