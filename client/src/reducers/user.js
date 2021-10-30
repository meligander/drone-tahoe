import {
	USER_LOADED,
	USERS_LOADED,
	USER_UPDATED,
	USER_DELETED,
	USERS_ERROR,
	USER_CLEARED,
	USERS_CLEARED,
	USER_ERROR,
} from '../actions/types';

const initialState = {
	loading: true,
	loadingUser: true,
	user: null,
	users: [],
	error: {},
};

const userReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case USER_LOADED:
			return {
				...state,
				loadingUser: false,
				user: payload,
				error: {},
			};
		case USERS_LOADED:
			return {
				...state,
				loading: false,
				users: payload,
				error: {},
			};
		case USER_UPDATED:
			return {
				...state,
				loading: false,
				users: state.users.map((user) =>
					user.id === payload.id ? payload : user
				),
				error: {},
			};
		case USER_DELETED:
			return {
				...state,
				users: state.users.filter((user) => user._id !== payload),
				loading: false,
				error: {},
			};
		case USERS_CLEARED:
			return initialState;
		case USER_CLEARED:
			return {
				...state,
				user: null,
				loadingUser: true,
				error: {},
			};
		case USER_ERROR:
			return {
				...state,
				user: null,
				loadingUser: false,
				error: payload,
			};
		case USERS_ERROR:
			return {
				...state,
				users: [],
				loading: false,
				error: payload,
			};
		default:
			return state;
	}
};

export default userReducer;
