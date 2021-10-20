import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import Alert from '../layouts/Alert';

const HourRangeForm = ({
	confirm,
	reservation: { reservations },
	day: { availableHours, loadingAvailableHours },
	setToggleModal,
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
	}, [confirm]);

	const onChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

		if (e.target.id === 'hourFrom' && e.target.value !== '') {
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

	return (
		<form
			className='form'
			onSubmit={(e) => {
				e.preventDefault();
				confirm(formData);
			}}
		>
			<h3 className='heading-primary-subheading'>Disable Hour Range:</h3>
			<Alert type='2' />
			<div className='form__group'>
				<div className='form__group-sub'>
					<div className='form__group-sub-item'>
						<select
							className={`form__input ${hourFrom === '' ? 'empty' : ''}`}
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
						<label
							htmlFor='hourFrom'
							className={`form__label ${hourFrom === '' ? 'hide' : ''}`}
						>
							Start
						</label>
					</div>
					<div className='form__group-sub-item'>
						<select
							className={`form__input ${hourTo === '' ? 'empty' : ''}`}
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
						<label
							htmlFor='hourTo'
							className={`form__label ${hourTo === '' ? 'hide' : ''}`}
						>
							End
						</label>
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

export default connect(mapStateToProps)(HourRangeForm);
