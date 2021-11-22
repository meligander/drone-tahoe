import axios from 'axios';
import store from './store';

import { logOut, setAuthError } from '../actions/auth';
import { updateLoadingSpinner } from '../actions/global';
import { setAlert } from '../actions/alert';
import { AUTH_ERROR } from '../actions/types';

const api = axios.create({
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
		'X-CSRF-TOKEN': localStorage.token,
	},
	withCredentials: true,
});

api.interceptors.response.use(
	(res) => res,
	(err) => {
		if (
			err.response.status === 401 &&
			(store.getState().alert.length === 0 ||
				!store.getState().alert.some((item) => item.code === 401))
		) {
			store.dispatch(logOut());
			store.dispatch(setAlert(err.response.data.msg, 'danger', '1', 401));
			store.dispatch(setAuthError(AUTH_ERROR, err.response));
			store.dispatch(updateLoadingSpinner(false));
			window.scrollTo(0, 0);
		}
		return Promise.reject(err);
	}
);

export default api;
