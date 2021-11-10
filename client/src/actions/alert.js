import { v4 as uuidv4 } from 'uuid';

import { ALERT_REMOVED, ALERT_SETTED } from './types';

export const setAlert =
	(msg, alertType, type = '1', code = 500) =>
	(dispatch) => {
		const id = uuidv4();
		dispatch({
			type: ALERT_SETTED,
			payload: {
				id,
				alertType,
				msg,
				type,
				code,
			},
		});

		setTimeout(
			() =>
				dispatch({
					type: ALERT_REMOVED,
					payload: id,
				}),
			5000
		);
	};
