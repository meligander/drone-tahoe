import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Calendar from 'react-calendar';
import { connect } from 'react-redux';
import {
	format,
	addDays,
	getHours,
	addYears,
	getMonth,
	getYear,
} from 'date-fns';

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
	setToggleModal,
	day: { availableHours, loadingAvailableHours, disabledDays },
	checkMonthAvailability,
	checkDayAvailability,
	updateReservation,
	registerReservation,
}) => {
	const today = addDays(new Date(), 1);
	const disabled =
		reservation.id !== 0 &&
		reservation.status !== 'requested' &&
		((loggedUser.type === 'customer' && reservation.status === 'unpaid') ||
			reservation.status !== 'unpaid');

	const [formData, setFormData] = useState({
		hourFrom: '',
		hourTo: '',
	});

	const { hourFrom, hourTo } = formData;

	const [adminValues, setAdminValues] = useState({
		date: new Date(),
		tab: 0,
		diff: 0,
		toggleModal: false,
		month: getMonth(today),
		year: getYear(today),
	});

	const { date, tab, diff, toggleModal, month, year } = adminValues;

	useEffect(() => {
		checkMonthAvailability(month, year, reservation.id, disabled ? diff : 0);
	}, [checkMonthAvailability, month, year, reservation.id, disabled, diff]);

	useEffect(() => {
		if (disabled) {
			const hourFrom = getHours(new Date(reservation.hourFrom.slice(0, -1)));
			const hourTo = getHours(new Date(reservation.hourTo.slice(0, -1)));
			setAdminValues((prev) => ({
				...prev,
				diff: hourTo - hourFrom,
			}));
		}
	}, [reservation, disabled]);

	const onChangeDate = (changedDate) => {
		setAdminValues((prev) => ({
			...prev,
			date: changedDate,
			tab: changedDate.getMonth() === month ? 1 : 0,
		}));
		checkDayAvailability(
			format(changedDate, "yyyy-MM-dd'T00:00:00Z'"),
			reservation.id,
			disabled ? diff : 0
		);
	};

	const selectHour = (type, time) => {
		const newDate = new Date(date);
		newDate.setHours(time);

		let newHourTo = null;
		if (disabled) {
			const oldHourFrom = new Date(reservation.hourFrom);
			const oldHourTo = new Date(reservation.hourTo);
			newHourTo = new Date(date);
			newHourTo.setHours(
				time + (oldHourTo.getHours() - oldHourFrom.getHours())
			);
		}

		setFormData((prev) => ({
			...prev,
			[type]: newDate,
			...(newHourTo && { hourTo: newHourTo }),
		}));

		setAdminValues((prev) => ({
			...prev,
			tab: type === 'hourFrom' && !newHourTo ? 2 : 3,
		}));
	};

	const tileDisabled = useCallback(
		({ date, view }) => {
			if (view === 'month' && disabledDays.length > 0) {
				// Check if a date React-Calendar wants to check is on the list of disabled dates
				return disabledDays.some(
					(disabledDay) =>
						format(new Date(disabledDay.slice(0, -1)), 'MM-dd-yyyy') ===
						format(date, 'MM-dd-yyyy')
				);
			}
		},
		[disabledDays]
	);

	const startTime = () => {
		let posibleHours = [];

		let minTime = disabled ? diff : 2;

		for (let x = 0; x < availableHours.length; x++) {
			let time =
				loggedUser.type === 'admin' || availableHours[x][0] === 8
					? availableHours[x][0]
					: availableHours[x][0] + 1;

			while (availableHours[x][1] - time > minTime) {
				posibleHours.push(time);
				time++;
			}
			if (availableHours[x][1] === 17) posibleHours.push(time);
			else if (
				loggedUser.type === 'admin' &&
				availableHours[x][1] - time === minTime
			)
				posibleHours.push(time);
		}

		return posibleHours.length > 0 ? (
			<Fragment>
				<p className='schedule-details-title'>
					{disabled ? 'Hour Range' : 'Start Time'}:
				</p>{' '}
				{posibleHours.map((hour, i) => (
					<div
						className='schedule-details-item'
						key={i}
						onClick={() => selectHour('hourFrom', hour)}
					>
						{`${hour % 12 !== 0 ? hour % 12 : 12} ${hour >= 12 ? 'pm' : 'am'}`}{' '}
						{disabled &&
							' - ' +
								`${(hour + diff) % 12 !== 0 ? (hour + diff) % 12 : 12} ${
									hour + diff >= 12 ? 'pm' : 'am'
								}`}
					</div>
				))}
			</Fragment>
		) : (
			<h2 className='schedule-details-main error'>
				No availability on this day
			</h2>
		);
	};

	const endTime = () => {
		let time = getHours(hourFrom);
		let posibleHours = [];

		const usedRange = availableHours.filter(
			(item) => item[0] <= time && item[1] > time
		)[0];

		time = time + 2;

		while (time < usedRange[1]) {
			posibleHours.push(time);
			time++;
		}
		if (usedRange[1] === 17) posibleHours.push(time);
		else if (loggedUser.type === 'admin' && time === usedRange[1])
			posibleHours.push(time);

		return posibleHours.length > 0 ? (
			<Fragment>
				<p className='schedule-details-title'>End Time:</p>{' '}
				{posibleHours.map((hour, i) => (
					<div
						className='schedule-details-item'
						key={i}
						onClick={() => selectHour('hourTo', hour)}
					>
						{`${hour % 12 !== 0 ? hour % 12 : 12} ${hour >= 12 ? 'pm' : 'am'}`}
					</div>
				))}
			</Fragment>
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
					<Fragment>
						<h5 className='schedule-details-main'>
							Pick up a Date and Time{' '}
							{loggedUser.type !== 'admin' && 'you are Available'}
						</h5>
					</Fragment>
				);
			case 1:
				return !loadingAvailableHours && startTime();
			case 2:
				return hourFrom !== '' && endTime();
			case 3:
				return (
					<Fragment>
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
									const answer = await registerReservation({
										...reservation,
										...(loggedUser.type === 'customer' && {
											user: loggedUser.id,
										}),
										hourFrom: format(hourFrom, "yyyy-MM-dd'T'HH':00:00Z'"),
										hourTo: format(hourTo, "yyyy-MM-dd'T'HH':00:00Z'"),
									});
									if (answer) setToggleModal();
								}
							}}
						>
							<Alert type='2' />
							<p className='schedule-details-info'>
								<span className='schedule-details-subtitle'>Date:</span> &nbsp;
								{format(hourFrom, 'MM/dd/yy')}
							</p>
							<p className='schedule-details-info'>
								<span className='schedule-details-subtitle'>Time:</span> &nbsp;
								{format(hourFrom, 'h aaa')} - {format(hourTo, 'h aaa')}
							</p>
							{loggedUser.type !== 'admin' && reservation.id === 0 && (
								<p className='text-warning'>
									After saving the reservation, we will set the price for the
									job and send you an email confirming your appointment, so you
									can proceed with its payment.
								</p>
							)}

							<div className='btn-center'>
								<button className='btn' type='submit'>
									Save
								</button>
							</div>
						</form>
					</Fragment>
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
				confirm={async () => {
					const answer = await updateReservation({
						...reservation,
						hourFrom: format(hourFrom, "yyyy-MM-dd'T'HH':00:00Z'"),
						hourTo: format(hourTo, "yyyy-MM-dd'T'HH':00:00Z'"),
					});
					if (answer) setToggleModal();
				}}
				text='Are you sure you want to modify the reservation?'
			/>

			<div className='schedule-calendar'>
				<Calendar
					value={date}
					onChange={onChangeDate}
					minDate={today}
					maxDate={addYears(today, 1)}
					onActiveStartDateChange={(e) => {
						if (e.view === 'month' || e.view === 'year') {
							const month = getMonth(e.activeStartDate);
							const year = getYear(e.activeStartDate);
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
