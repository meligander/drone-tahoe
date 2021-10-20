import {
	JOB_LOADED,
	JOBS_LOADED,
	JOB_REGISTERED,
	JOB_UPDATED,
	JOB_DELETED,
	JOBS_ERROR,
	JOBS_CLEARED,
	JOB_CLEARED,
	JOB_DELETION_ERROR,
} from '../actions/types';

const initialState = {
	loading: true,
	loadingJob: true,
	job: null,
	jobs: [],
	error: {},
};

const jobReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case JOB_LOADED:
			return {
				...state,
				loadingJob: false,
				job: payload,
				error: {},
			};
		case JOBS_LOADED:
			return {
				...state,
				loading: false,
				jobs: payload,
				error: {},
			};
		case JOB_REGISTERED:
			return {
				...state,
				loading: false,
				jobs: [...state.jobs, payload],
				error: {},
			};
		case JOB_UPDATED:
			return {
				...state,
				loading: false,
				job: payload,
				loadingJob: false,
				jobs: state.jobs.map((item) =>
					item.id !== payload.id ? item : payload
				),
				error: {},
			};
		case JOB_DELETED:
			return {
				...state,
				jobs: state.jobs.filter((item) => item.id !== payload),
				loading: false,
				error: {},
			};
		case JOBS_CLEARED:
			return initialState;
		case JOB_CLEARED:
			return {
				...state,
				job: null,
				loadingJob: true,
			};
		case JOBS_ERROR:
			return {
				...state,
				job: null,
				loadingJob: false,
				error: payload,
			};
		case JOB_DELETION_ERROR:
			return {
				...state,
				error: payload,
			};
		default:
			return state;
	}
};

export default jobReducer;
