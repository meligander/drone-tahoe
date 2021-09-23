import React, { useState, useEffect } from 'react';
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
	job,
	auth: { loggedUser },
	reservation,
	complete,
	day: { availableHours, loadingAvailableHours, disabledDays },
	checkMonthAvailability,
	checkDayAvailability,
	updateReservation,
	registerReservation,
	userId,
}) => {
	const today = moment().add(1, 'day');

	const [formData, setFormData] = useState({
		hourFrom: '',
		hourTo: '',
		value: job.price,
		job: job.id,
		user: '',
	});

	const { hourFrom, hourTo, value, user } = formData;

	const [adminValues, setAdminValues] = useState({
		date: new Date(),
		tab: 0,
		toggleModal: false,
		month: today.month(),
		year: today.year(),
	});

	const { date, tab, toggleModal, month, year } = adminValues;

	useEffect(() => {
		if (user === '')
			setFormData((prev) => ({
				...prev,
				user: userId === undefined ? loggedUser.id : userId,
			}));
		else checkMonthAvailability(job.id, month, year);
	}, [checkMonthAvailability, job.id, loggedUser, month, year, user, userId]);

	const onChangeDate = (changedDate) => {
		setAdminValues((prev) => ({
			...prev,
			date: changedDate,
			tab: 1,
		}));
		checkDayAvailability(
			moment(changedDate).format('YYYY-MM-DD[T00:00:00Z]'),
			job.id
		);
	};

	const selectHourFrom = (time) => {
		const newDate = new Date(date);
		newDate.setHours(time);

		let newToDate;

		newToDate = new Date(newDate);
		newToDate.setHours(newDate.getHours() + job.time);

		setFormData((prev) => ({
			...prev,
			hourFrom: newDate,
			hourTo: newToDate,
		}));

		setAdminValues((prev) => ({
			...prev,
			tab: 2,
		}));
	};

	const tileDisabled = ({ date, view }) => {
		if (view === 'month' && disabledDays.length > 0) {
			// Check if a date React-Calendar wants to check is on the list of disabled dates
			return disabledDays.find((dDate) => isSameDay(dDate, date));
		}
	};

	const isSameDay = (date1, date2) => {
		if (
			moment(date1.substring(0, date1.length - 2)).format('MM-DD-YYYY') ===
			moment(date2).format('MM-DD-YYYY')
		)
			return true;
		return false;
	};

	const createRange = () => {
		let posibleHours = [];

		for (let x = 0; x < availableHours.length; x++) {
			let time = availableHours[x][0] === 8 ? 8 : availableHours[x][0] + 1;
			while (availableHours[x][1] - time > job.time) {
				posibleHours.push(time);
				time++;
			}
			if (availableHours[x][1] === 17) posibleHours.push(time);
		}

		return posibleHours.length > 0 ? (
			<>
				<p className='schedule-details-title'>Time Range:</p>{' '}
				{posibleHours.map((hour, i) => {
					const to = hour + job.time;
					return (
						<div
							className='schedule-details-item'
							key={i}
							onClick={() => selectHourFrom(hour)}
						>
							{`${hour % 12 !== 0 ? hour % 12 : 12} ${
								hour >= 12 ? 'pm' : 'am'
							}`}{' '}
							-{` ${to % 12 !== 0 ? to % 12 : 12} ${to >= 12 ? 'pm' : 'am'}`}
						</div>
					);
				})}
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
							Pick up a {reservation && 'New'} Date
						</h5>
					</>
				);
			case 1:
				return !loadingAvailableHours && createRange();
			case 2:
				return (
					<>
						<p className='schedule-details-title'>
							{reservation ? 'New' : 'Reservation'} Info:
						</p>
						<form
							className='form'
							onSubmit={(e) => {
								e.preventDefault();

								if (reservation) {
									setAdminValues((prev) => ({
										...prev,
										toggleModal: !toggleModal,
									}));
								} else {
									registerReservation({
										...formData,
										hourFrom: moment(hourFrom).format(
											'YYYY-MM-DD[T]HH[:00:00Z]'
										),
										hourTo: moment(hourTo).format('YYYY-MM-DD[T]HH[:00:00Z]'),
									});

									complete();
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
							{!reservation && (
								<p className='schedule-details-info'>
									<span className='schedule-details-subtitle'>Price:</span> $
									{value}
								</p>
							)}

							<div className='u-center-text'>
								<button type='submit' className='btn btn-primary'>
									{reservation ? 'Update' : 'Reserve Now!'}
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
					updateReservation(
						{
							hourFrom: moment(hourFrom).format('YYYY-MM-DD[T]HH:mm:SS[Z]'),
							hourTo: moment(hourTo).format('YYYY-MM-DD[T]HH:mm:SS[Z]'),
						},
						reservation.id,
						loggedUser.type
					);
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
