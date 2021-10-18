import {
	FOOTER_HEIGHT_SETTED,
	LOADINGSPINNER_UPDATED,
	NAVBAR_HEIGHT_SETTED,
} from './types';

export const updateLoadingSpinner = (bool) => (dispatch) => {
	dispatch({
		type: LOADINGSPINNER_UPDATED,
		payload: bool,
	});
};

export const setFooterHeight = (height) => (dispatch) => {
	dispatch({
		type: FOOTER_HEIGHT_SETTED,
		payload: height,
	});
};

export const setNavbarHeight = (height) => (dispatch) => {
	dispatch({
		type: NAVBAR_HEIGHT_SETTED,
		payload: height,
	});
};
