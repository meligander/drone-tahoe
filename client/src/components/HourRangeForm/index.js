import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { registerReservation } from '../../actions/reservation';

import Alert from '../layouts/Alert';

const HourRangeForm = ({
	registerReservation,
	setToggleModal,
	confirm,
	auth: { loggedUser },
	reservation: { reservations },
	day: { availableHours, loadingAvailableHours },
	date,
}) => {
	const [formData, setFormData] = useState({
		hourFrom: '',
		hourTo: '',
	});

	const { hourFrom, hourTo } = formData;

	const [adminValues, setAdminValues] = useState({
		rangeFrom: [],
		rangeTo: [],
	});

	const { rangeFrom, rangeTo } = adminValues;

	useEffect(() => {
		if (!loadingAvailableHours) {
			let rangeFrom = [];

			let unavailableRange = reservations.filter((item) => !item.jobId);

			unavailableRange = unavailableRange.map((item) => {
				const date = new Date(item.hourTo);
				return date.getUTCHours();
			});

			for (let x = 0; x < availableHours.length; x++) {
				for (let y = availableHours[x][0]; y < availableHours[x][1]; y++) {
					if (
						unavailableRange.length === 0 ||
						unavailableRange.some((item) => item !== y)
					)
						rangeFrom.push(y);
				}
			}

			setAdminValues((prev) => ({ ...prev, rangeFrom }));
		}
	}, [loadingAvailableHours, availableHours, reservations]);

	useEffect(() => {
		setFormData({
			hourFrom: '',
			hourTo: '',
		});
	}, [setToggleModal]);

	const onChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

		if (e.target.id === 'hourFrom') {
			let rangeTo = [];

			let start = e.target.value;
			const index = availableHours.findIndex(
				(item) => start >= item[0] && start <= item[1]
			);

			start++;

			while (start <= availableHours[index][1]) {
				rangeTo.push(start);
				start++;
			}
			setAdminValues((prev) => ({ ...prev, rangeTo }));
		}
	};

	const onSubmit = (e) => {
		e.preventDefault();
		registerReservation(
			{
				hourFrom: moment(date)
					.set('hour', hourFrom)
					.format('YYYY-MM-DD[T]HH[:00:00Z]'),
				hourTo: moment(date)
					.set('hour', hourTo - 1)
					.format('YYYY-MM-DD[T]HH[:00:00Z]'),
				user: loggedUser.id,
				value: 0,
			},
			false,
			reservations.length === 0 && moment(date).format('YYYY-MM-DD[T00:00:00Z]')
		);
		confirm();
		setToggleModal();
	};

	return (
		<form className='form' onSubmit={onSubmit}>
			<Alert type='2' />
			<div className='form__group'>
				<div className='form__group-sub'>
					<div className='form__group-sub-item'>
						<label htmlFor='hourFrom' className='form__label'>
							From
						</label>
						<select
							className='form__input'
							id='hourFrom'
							value={hourFrom}
							onChange={onChange}
						>
							<option value=''>* Start</option>
							{!loadingAvailableHours &&
								rangeFrom.map((item, key) => (
									<option key={key} value={item}>
										{`${item % 12 !== 0 ? item % 12 : 12} ${
											item >= 12 ? 'pm' : 'am'
										}`}
									</option>
								))}
						</select>
					</div>
					<div className='form__group-sub-item'>
						<label htmlFor='hourTo' className='form__label'>
							To
						</label>
						<select
							className='form__input'
							id='hourTo'
							value={hourTo}
							onChange={onChange}
							disabled={hourFrom === ''}
						>
							<option value=''>* End</option>
							{rangeTo.map((item, key) => (
								<option key={key} value={item}>
									{`${item % 12 !== 0 ? item % 12 : 12} ${
										item >= 12 ? 'pm' : 'am'
									}`}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<div className='popup-btns'>
				<button className='btn btn-success' type='submit'>
					Save
				</button>
				<button
					type='button'
					className='btn btn-danger'
					onClick={setToggleModal}
				>
					Cancel
				</button>
			</div>
		</form>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	day: state.day,
	reservation: state.reservation,
});

export default connect(mapStateToProps, { registerReservation })(HourRangeForm);
