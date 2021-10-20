import React, { useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import { connect } from 'react-redux';

import {
	checkMonthSchedule,
	checkDayAvailability,
	disableDate,
	disableDateRange,
	enableDate,
} from '../../../actions/day';
import {
	loadReservations,
	deleteReservation,
	clearReservations,
	disableHourRange,
} from '../../../actions/reservation';
import { setAlert } from '../../../actions/alert';
import { clearUsers } from '../../../actions/user';

import Alert from '../../layouts/Alert';

import './ManageSchedule.scss';
import Moment from 'react-moment';
import PopUp from '../../layouts/PopUp';

const ManageSchedule = ({
	day: { disabledDays, reservedDays, timeDisabledDays },
	reservation: { loading, reservations },
	auth: { loggedUser },
	checkMonthSchedule,
	checkDayAvailability,
	loadReservations,
	deleteReservation,
	disableHourRange,
	disableDate,
	enableDate,
	setAlert,
	disableDateRange,
	clearReservations,
	clearUsers,
}) => {
	const today = moment();

	const [adminValues, setAdminValues] = useState({
		date: new Date(),
		tab: 0,
		range: false,
		month: today.month(),
		year: today.year(),
		toggleModal: false,
	});

	const { date, tab, range, month, year, toggleModal } = adminValues;

	useEffect(() => {
		checkMonthSchedule(month, year);
	}, [checkMonthSchedule, month, year]);

	useEffect(() => {
		if (range && date[1] && date[0].getDate() !== date[1].getDate()) {
			const startDate = moment(date[0], 'DD/MM/YYYY');
			const endDate = moment(date[1], 'DD/MM/YYYY');

			const betweenArrays =
				reservedDays.some((item) => {
					const compareDate = moment(item).add(1, 'day');
					return compareDate.isBetween(startDate, endDate);
				}) ||
				disabledDays.some((item) => {
					const compareDate = moment(item).add(1, 'day');
					return compareDate.isBetween(startDate, endDate);
				}) ||
				timeDisabledDays.some((item) => {
					const compareDate = moment(item).add(1, 'day');
					return compareDate.isBetween(startDate, endDate);
				});

			if (betweenArrays) {
				setAlert(
					'Can not choose a range with a disabled day or a day with a reservation in between.',
					'danger',
					'2'
				);
				setAdminValues((prev) => ({
					...prev,
					date: [date[0], date[0]],
					tab: 0,
				}));
			}
		}
	}, [range, date, setAlert, disabledDays, reservedDays, timeDisabledDays]);

	const onChangeDate = (changedDate) => {
		let loadRes;

		if (!range) {
			changedDate.setHours(0, 0, 0, 0);

			loadRes =
				reservedDays.some((item) => {
					const pastDate = new Date(item);
					return pastDate.getUTCDate() === changedDate.getDate();
				}) ||
				timeDisabledDays.some((item) => {
					const pastDate = new Date(item);
					return pastDate.getUTCDate() === changedDate.getDate();
				});

			if (loadRes)
				loadReservations({
					hourFrom: changedDate,
					hourTo: changedDate,
					type: 'all',
				});
		}

		setAdminValues((prev) => ({
			...prev,
			date: changedDate,
			tab: range ? 3 : loadRes ? 1 : 2,
		}));
	};

	const tileClassName = useCallback(
		(info) => {
			return info.view === 'month' &&
				reservedDays.some((item) => {
					const pastDate = new Date(item);
					return (
						pastDate.getUTCDate() === info.date.getDate() &&
						pastDate.getUTCMonth() === info.date.getMonth()
					);
				})
				? 'reserved'
				: disabledDays.some((item) => {
						const pastDate = new Date(item);
						return (
							pastDate.getUTCDate() === info.date.getDate() &&
							pastDate.getUTCMonth() === info.date.getMonth()
						);
				  })
				? 'disabled'
				: timeDisabledDays.some((item) => {
						const pastDate = new Date(item);
						return (
							pastDate.getUTCDate() === info.date.getDate() &&
							pastDate.getUTCMonth() === info.date.getMonth()
						);
				  }) && 'time-disabled';
		},
		[disabledDays, reservedDays, timeDisabledDays]
	);

	const tileDisabled = useCallback(({ date, view }) => {
		if (view === 'month') return date.getDay() === 6 || date.getDay() === 0;
	}, []);

	const tabOpen = () => {
		switch (tab) {
			case 0:
				return (
					<>
						<h5 className='manage-schedule-details-title'>Select a Date</h5>
					</>
				);
			case 1:
				return (
					!loading && (
						<>
							<Alert type='1' />
							<h5 className='manage-schedule-details-title'>
								{reservations.every((item) => item.jobs.length === 0)
									? 'Unavailable Time Ranges'
									: 'Reservations'}{' '}
								- <Moment format='MM/DD/YY' date={date} />
							</h5>
							<div className='manage-schedule-details-res'>
								{reservations.map((item) => (
									<div
										className={`manage-schedule-details-item tooltip ${
											item.jobs.length === 0 && 'disabled'
										}`}
										key={item.id}
									>
										<div>
											<Moment format='h a' utc date={item.hourFrom} />
											&nbsp; - &nbsp;
											<Moment
												format='h a'
												utc
												date={
													item.jobs.length > 0
														? item.hourTo
														: moment(item.hourTo).add(1, 'hour')
												}
											/>
										</div>
										<Link
											onClick={() => {
												clearUsers();
												window.scrollTo(0, 0);
											}}
											className='btn-link'
											to={`/edit-user/${item.user.id}`}
										>{`${item.user.name} ${item.user.lastname}`}</Link>
										{item.jobs.length > 0 ? (
											<p>{item.address}</p>
										) : (
											<button
												className='btn-icon'
												onClick={() => {
													if (reservations.length === 1)
														setAdminValues((prev) => ({ ...prev, tab: 2 }));

													deleteReservation(
														item,
														moment(date).format('YYYY-MM-DD[T00:00:00Z]')
													);
												}}
											>
												<i className='far fa-trash-alt'></i>
											</button>
										)}
									</div>
								))}
							</div>
							<div className='btn-right'>
								<button
									className='btn btn-quaternary'
									onClick={() => {
										setAdminValues((prev) => ({
											...prev,
											toggleModal: !toggleModal,
										}));
										checkDayAvailability(
											moment(date).format('YYYY-MM-DD[T00:00:00Z]'),
											0,
											0
										);
									}}
								>
									<i className='fas fa-ban'></i> &nbsp; Hour Range
								</button>
							</div>
						</>
					)
				);
			case 2:
				const disable = disabledDays.some((item) => {
					const pastDate = new Date(item);
					return pastDate.getUTCDate() === date.getDate();
				});
				return (
					<>
						<h5
							className={`manage-schedule-details-title ${
								disable && 'text-danger'
							}`}
						>
							<Moment date={date} format='MM/DD/YYYY' />
						</h5>
						<div className='btn-center'>
							{disable ? (
								<button
									className='btn'
									onClick={() =>
										enableDate(moment(date).format('YYYY-MM-DD[T00:00:00Z]'))
									}
								>
									<i className='far fa-check-circle'></i> &nbsp; Date
								</button>
							) : (
								<>
									<button
										className='btn'
										onClick={() =>
											disableDate(moment(date).format('YYYY-MM-DD[T00:00:00Z]'))
										}
									>
										<i className='fas fa-ban'></i> &nbsp; Date
									</button>
									<button
										className='btn'
										onClick={() => {
											setAdminValues((prev) => ({
												...prev,
												toggleModal: !toggleModal,
											}));
											if (reservations.length > 0) clearReservations();
											checkDayAvailability(
												moment(date).format('YYYY-MM-DD[T00:00:00Z]'),
												0,
												0
											);
										}}
									>
										<i className='fas fa-ban'></i> &nbsp; Hour Range
									</button>
								</>
							)}
						</div>
					</>
				);
			case 3:
				return (
					<>
						<h5 className='manage-schedule-details-title'>
							<Moment date={date[0]} format='MM/DD/YYYY' /> -{' '}
							<Moment date={date[1]} format='MM/DD/YYYY' />
						</h5>
						<div className='btn-center'>
							<button
								className='btn'
								onClick={() => {
									setAdminValues((prev) => ({
										...prev,
										range: !range,
										date: date[0],
										tab: 0,
									}));

									disableDateRange(
										moment(date[0]).format('YYYY-MM-DD[T00:00:00Z]'),
										moment(date[1]).format('YYYY-MM-DD[T00:00:00Z]')
									);
								}}
							>
								<i className='fas fa-ban'></i> &nbsp; Date Range
							</button>
						</div>
					</>
				);
			default:
				break;
		}
	};

	return (
		<div className='list manage-schedule'>
			<PopUp
				type='hour'
				toggleModal={toggleModal}
				confirm={async ({ hourFrom, hourTo }) => {
					const answer = await disableHourRange(
						{
							hourFrom: moment(date)
								.set('hour', hourFrom)
								.format('YYYY-MM-DD[T]HH[:00:00Z]'),
							hourTo: moment(date)
								.set('hour', hourTo - 1)
								.format('YYYY-MM-DD[T]HH[:00:00Z]'),
							user: loggedUser.id,
						},
						reservations.length === 0 &&
							moment(date).format('YYYY-MM-DD[T00:00:00Z]')
					);

					if (answer)
						setAdminValues((prev) => ({
							...prev,
							tab: 1,
							toggleModal: !toggleModal,
						}));
				}}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleModal: !toggleModal,
					}))
				}
			/>
			<h2 className='heading-primary'>Schedule</h2>
			<div className='manage-schedule-row'>
				<div className='manage-schedule-calendar'>
					<Calendar
						value={date}
						selectRange={range}
						onChange={onChangeDate}
						tileDisabled={tileDisabled}
						minDate={new Date(today.format())}
						maxDate={new Date(today.year() + 1, today.month(), today.date())}
						onActiveStartDateChange={(e) => {
							if (e.view === 'month') {
								const month = e.activeStartDate.getMonth();
								const year = e.activeStartDate.getFullYear();
								setAdminValues((prev) => ({ ...prev, month, year }));
							}
						}}
						tileClassName={tileClassName}
					/>
					<div className='form__group switch' id='range'>
						<label className='form__label-switch' htmlFor='range'>
							Date Range
						</label>
						<input
							checked={range}
							type='checkbox'
							onChange={() =>
								setAdminValues((prev) => ({
									...prev,
									range: !range,
								}))
							}
							className='form__input-switch'
						/>
					</div>
				</div>
				<div className='manage-schedule-details'>
					<Alert type='2' />
					{tabOpen()}
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => ({
	day: state.day,
	reservation: state.reservation,
	auth: state.auth,
});

export default connect(mapStateToProps, {
	checkMonthSchedule,
	checkDayAvailability,
	loadReservations,
	disableDate,
	enableDate,
	setAlert,
	disableDateRange,
	disableHourRange,
	clearUsers,
	clearReservations,
	deleteReservation,
})(ManageSchedule);
