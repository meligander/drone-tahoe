import React, { useState, useEffect, useCallback } from 'react';
import Moment from 'react-moment';
import moment from 'moment';
import Calendar from 'react-calendar';
import { connect } from 'react-redux';

import {
	checkDayAvailability,
	checkMonthAvailability,
} from '../../actions/day';
import {
	updateReservation,
	registerReservation,
} from '../../actions/reservation';

import Alert from '../layouts/Alert';
import PopUp from '../layouts/PopUp';

import './Schedule.scss';

const Schedule = ({
	auth: { loggedUser },
	reservation,
	complete,
	day: { availableHours, loadingAvailableHours, disabledDays },
	checkMonthAvailability,
	checkDayAvailability,
	updateReservation,
	registerReservation,
}) => {
	const today = moment().add(1, 'day');

	const [formData, setFormData] = useState({
		hourFrom: '',
		hourTo: '',
	});

	const { hourFrom, hourTo } = formData;

	const [adminValues, setAdminValues] = useState({
		date: new Date(),
		tab: 0,
		toggleModal: false,
		month: today.month(),
		year: today.year(),
	});

	const { date, tab, toggleModal, month, year } = adminValues;

	useEffect(() => {
		checkMonthAvailability(month, year, reservation.id);
	}, [checkMonthAvailability, month, year, reservation.id]);

	const onChangeDate = (changedDate) => {
		setAdminValues((prev) => ({
			...prev,
			date: changedDate,
			tab: 1,
		}));
		checkDayAvailability(
			moment(changedDate).format('YYYY-MM-DD[T00:00:00Z]'),
			reservation.id
		);
	};

	const selectHour = (type, time) => {
		const newDate = new Date(date);
		newDate.setHours(time);

		setFormData((prev) => ({
			...prev,
			[type]: newDate,
		}));

		setAdminValues((prev) => ({
			...prev,
			tab: type === 'hourFrom' ? 2 : 3,
		}));
	};

	const tileDisabled = useCallback(
		({ date, view }) => {
			if (view === 'month' && disabledDays.length > 0) {
				// Check if a date React-Calendar wants to check is on the list of disabled dates
				return disabledDays.find((dDate) => isSameDay(dDate, date));
			}
		},
		[disabledDays]
	);

	const isSameDay = (date1, date2) => {
		if (
			moment(date1.substring(0, date1.length - 2)).format('MM-DD-YYYY') ===
			moment(date2).format('MM-DD-YYYY')
		)
			return true;
		return false;
	};

	const startTime = () => {
		let posibleHours = [];

		for (let x = 0; x < availableHours.length; x++) {
			let time =
				loggedUser.type === 'admin' || availableHours[x][0] === 8
					? availableHours[x][0]
					: availableHours[x][0] + 1;

			while (availableHours[x][1] - time > 2) {
				posibleHours.push(time);
				time++;
			}
			if (availableHours[x][1] === 17) posibleHours.push(time);
		}

		return posibleHours.length > 0 ? (
			<>
				<p className='schedule-details-title'>Start time:</p>{' '}
				{posibleHours.map((hour, i) => (
					<div
						className='schedule-details-item'
						key={i}
						onClick={() => selectHour('hourFrom', hour)}
					>
						{`${hour % 12 !== 0 ? hour % 12 : 12} ${hour >= 12 ? 'pm' : 'am'}`}
					</div>
				))}
			</>
		) : (
			<h2 className='schedule-details-main error'>
				No availability on this day
			</h2>
		);
	};

	const endTime = () => {
		let start = moment(hourFrom).hour();
		let posibleHours = [];

		const tillTime = availableHours.filter(
			(item) => item[0] <= start && item[1] > start
		)[0][1];

		start = start + 2;

		while (start <= tillTime) {
			posibleHours.push(start);
			start++;
		}

		return posibleHours.length > 0 ? (
			<>
				<p className='schedule-details-title'>End time:</p>{' '}
				{posibleHours.map((hour, i) => (
					<div
						className='schedule-details-item'
						key={i}
						onClick={() => selectHour('hourTo', hour)}
					>
						{`${hour % 12 !== 0 ? hour % 12 : 12} ${hour >= 12 ? 'pm' : 'am'}`}
					</div>
				))}
			</>
		) : (
			<h2 className='schedule-details-main error'>
				No availability on this day
			</h2>
		);
	};

	const tabOpen = () => {
		switch (tab) {
			case 0:
				return (
					<>
						<h5 className='schedule-details-main'>
							Pick up a Date and Time{' '}
							{loggedUser.type !== 'admin' && 'you are Available'}
						</h5>
					</>
				);
			case 1:
				return !loadingAvailableHours && startTime();
			case 2:
				return hourFrom !== '' && endTime();
			case 3:
				return (
					<>
						<p className='schedule-details-title'>Reservation Schedule:</p>
						<form
							className='form'
							onSubmit={async (e) => {
								e.preventDefault();

								if (reservation.id !== 0) {
									setAdminValues((prev) => ({
										...prev,
										toggleModal: !toggleModal,
									}));
								} else {
									//createReservation
									console.log({
										...reservation,
										hourFrom: moment(hourFrom).format(
											'YYYY-MM-DD[T]HH[:00:00Z]'
										),
										hourTo: moment(hourTo).format('YYYY-MM-DD[T]HH[:00:00Z]'),
									});
									const answer = await registerReservation(
										{
											...reservation,
											...(loggedUser.type === 'customer' && {
												user: loggedUser.id,
											}),
											hourFrom: moment(hourFrom).format(
												'YYYY-MM-DD[T]HH[:00:00Z]'
											),
											hourTo: moment(hourTo).format('YYYY-MM-DD[T]HH[:00:00Z]'),
										},
										moment(hourFrom).format('YYYY-MM-DD[T00:00:00Z]')
									);
									if (answer) {
										complete();
										setAdminValues((prev) => ({
											...prev,
											tab: 0,
											date: new Date(),
										}));
									}
								}
							}}
						>
							<Alert type='2' />
							<p className='schedule-details-info'>
								<span className='schedule-details-subtitle'>Date:</span> &nbsp;
								<Moment date={hourFrom} format='MM/DD/YY' />
							</p>
							<p className='schedule-details-info'>
								<span className='schedule-details-subtitle'>Time:</span> &nbsp;
								<Moment format='h a' date={hourFrom} /> -{' '}
								<Moment format='h a' date={hourTo} />
							</p>
							{loggedUser.type !== 'admin' && (
								<p className='schedule-details-warning'>
									After creating the reservation, the admin will set a price for
									the job, so you can proceed with its payment.
								</p>
							)}

							<div className='btn-center'>
								<button className='btn' type='submit'>
									<i className='far fa-save'></i>
								</button>
							</div>
						</form>
					</>
				);
			default:
				break;
		}
	};

	return (
		<div className='schedule'>
			<PopUp
				type='confirmation'
				toggleModal={toggleModal}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleModal: !toggleModal,
					}))
				}
				confirm={() => {
					/* updateReservation(
						{
							hourFrom: moment(hourFrom).format('YYYY-MM-DD[T]HH:mm:SS[Z]'),
							hourTo: moment(hourTo).format('YYYY-MM-DD[T]HH:mm:SS[Z]'),
						},
						reservation.id,
						 moment(hourFrom).format('YYYY-MM-DD[T00:00:00Z]')
					); */
					complete();
				}}
				text='Are you sure you want to modify the reservation?'
			/>

			<div className='schedule-calendar'>
				<Calendar
					value={date}
					onChange={onChangeDate}
					minDate={new Date(today.format())}
					maxDate={new Date(today.year() + 1, today.month(), today.date())}
					onActiveStartDateChange={(e) => {
						if (e.view === 'month') {
							const month = e.activeStartDate.getMonth();
							const year = e.activeStartDate.getFullYear();
							setAdminValues((prev) => ({ ...prev, month, year }));
						}
					}}
					tileDisabled={tileDisabled}
				/>
			</div>
			<div className='schedule-details'>{tabOpen()}</div>
		</div>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	day: state.day,
});

export default connect(mapStateToProps, {
	checkDayAvailability,
	checkMonthAvailability,
	updateReservation,
	registerReservation,
})(Schedule);
