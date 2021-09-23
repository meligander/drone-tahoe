import { LOADINGSPINNER_UPDATED } from './types';

export const updateLoadingSpinner = (bool) => (dispatch) => {
	dispatch({
		type: LOADINGSPINNER_UPDATED,
		payload: bool,
	});
};
