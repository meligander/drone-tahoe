import {
	USERAUTH_LOADED,
	AUTH_ERROR,
	LOGIN_FAIL,
	LOGIN_SUCCESS,
	LOGOUT,
	SIGNUP_FAIL,
	EMAIL_SENT,
	SIGNUP_SUCCESS,
	PASSWORD_CHANGED,
	EMAIL_ERROR,
	EMAIL_CLEARED,
} from '../actions/types';

const initialState = {
	token: localStorage.getItem('token'),
	loggedUser: null,
	loading: true,
	isAuthenticated: false,
	error: '',
	emailSent: false,
};

const authReducer = (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case USERAUTH_LOADED:
			return {
				...state,
				loading: false,
				loggedUser: payload,
				isAuthenticated: true,
			};
		case SIGNUP_SUCCESS:
			return {
				...state,
				loading: false,
				loggedUser: payload.user,
				isAuthenticated: true,
				token: payload.token,
			};
		case LOGIN_SUCCESS:
			return {
				...state,
				loading: false,
				token: payload.token,
			};
		case AUTH_ERROR:
			return {
				...state,
				token: null,
				isAuthenticated: false,
				loggedUser: null,
				loading: false,
				error: payload ? payload : '',
			};
		case PASSWORD_CHANGED:
			return {
				...state,
				token: payload.token,
				loading: false,
				loggedUser: payload.user,
				isAuthenticated: true,
			};

		case SIGNUP_FAIL:
		case LOGIN_FAIL:
			return {
				...state,
				error: payload,
				loading: false,
				token: null,
				isAuthenticated: false,
				loggedUser: null,
			};
		case EMAIL_ERROR:
			return {
				...state,
				error: payload,
				emailSent: false,
			};
		case EMAIL_SENT:
			return {
				...state,
				emailSent: true,
				error: '',
			};
		case LOGOUT:
			return {
				...state,
				token: null,
				isAuthenticated: false,
				loggedUser: null,
				loading: true,
				error: '',
			};
		case EMAIL_CLEARED:
			return {
				...state,
				emailSent: false,
			};
		default:
			return state;
	}
};

export default authReducer;
