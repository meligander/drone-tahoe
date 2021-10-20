import axios from 'axios';
import store from '../store';

import { logOut } from '../actions/auth';

const api = axios.create({
	baseURL: '/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.response.use(
	(res) => res,
	(err) => {
		if (
			err.response.status === 401 &&
			err.response.data.msg !== 'Unauthorized User'
		) {
			window.scrollTo(0, 0);
			store.dispatch(logOut());
		}
		return Promise.reject(err);
	}
);

export default api;
