import axios from 'axios';
import store from '../store';
import history from './history';

import { LOGOUT } from '../actions/types';

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
			store.dispatch({ type: LOGOUT });
			history.push('/login');
			window.scrollTo(0, 0);
		}
		return Promise.reject(err);
	}
);

export default api;
