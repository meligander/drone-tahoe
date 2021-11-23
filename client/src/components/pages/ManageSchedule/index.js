import React, { useState, useCallback, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import { connect } from 'react-redux';
import { format, isBefore, setHours, addHours, addYears } from 'date-fns';

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
import { clearUsers } from '../../../actions/user';
import { loadJobs } from '../../../actions/jobs';
import { clearJobsXReservations } from '../../../actions/jobsXReservations';

import Alert from '../../layouts/Alert';

import './ManageSchedule.scss';
import PopUp from '../../layouts/PopUp';

const ManageSchedule = ({
	day: { disabledDays, reservedDays, timeDisabledDays },
	reservation: { loading, reservations },
	auth: { loggedUser },
	job: { loading: loadingJobs },
	checkMonthSchedule,
	checkDayAvailability,
	loadReservations,
	deleteReservation,
	disableHourRange,
	disableDate,
	enableDate,
	disableDateRange,
	clearReservations,
	clearUsers,
	clearJobsXReservations,
	loadJobs,
}) => {
	const today = new Date();

	const [adminValues, setAdminValues] = useState({
		date: new Date(),
		tab: 0,
		range: false,
		month: today.getMonth(),
		year: today.getFullYear(),
		toggleModal: false,
		toggleReservation: false,
		reservation: null,
	});

	const {
		date,
		tab,
		range,
		month,
		year,
		toggleModal,
		toggleReservation,
		reservation,
	} = adminValues;

	useEffect(() => {
		checkMonthSchedule(month, year);
	}, [checkMonthSchedule, month, year]);

	useEffect(() => {
		if (loadingJobs) loadJobs({}, true);
	}, [loadingJobs, loadJobs]);

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
					available: true,
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
			const list = [reservedDays, disabledDays, timeDisabledDays];
			const classes = ['reserved', 'disabled', 'time-disabled'];

			if (info.view === 'month')
				for (let x = 0; x < list.length; x++) {
					if (
						list[x].some(
							(item) =>
								format(new Date(item.slice(0, -1)), 'dd/MM/yyyy') ===
								format(info.date, 'dd/MM/yyyy')
						)
					)
						return classes[x];
				}
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
					<Fragment>
						<h5 className='manage-schedule-details-title'>Select a Date</h5>
					</Fragment>
				);
			case 1:
				return (
					!loading && (
						<Fragment>
							<Alert type='1' />
							<h5 className='manage-schedule-details-title'>
								{reservations.every((item) => item.status === 'hourRange')
									? 'Unavailable Time Ranges'
									: 'Reservations'}{' '}
								- {format(date, 'MM/dd/yy')}
							</h5>
							<div className='manage-schedule-details-res'>
								{reservations.map((item) => (
									<div
										className={`manage-schedule-details-item tooltip ${
											item.status === 'hourRange' && 'disabled'
										}`}
										key={item.id}
									>
										<div>
											{format(new Date(item.hourFrom.slice(0, -1)), 'h aaa')}
											&nbsp; - &nbsp;
											{format(
												item.status !== 'hourRange'
													? new Date(item.hourTo.slice(0, -1))
													: addHours(new Date(item.hourTo.slice(0, -1)), 1),
												'h aaa'
											)}
										</div>
										<Link
											onClick={() => {
												clearUsers();
												window.scrollTo(0, 0);
											}}
											className='btn-link'
											to={`/edit-user/${item.user.id}`}
										>{`${item.user.name} ${item.user.lastname}`}</Link>
										{item.status !== 'hourRange' ? (
											<button
												className='btn-icon'
												onClick={() =>
													setAdminValues((prev) => ({
														...prev,
														toggleReservation: !toggleReservation,
														reservation: item,
													}))
												}
											>
												<i className='fas fa-search'></i>
											</button>
										) : (
											<button
												className='btn-icon'
												onClick={() => {
													if (reservations.length === 1)
														setAdminValues((prev) => ({ ...prev, tab: 2 }));

													deleteReservation(
														item,
														reservations.length === 1 &&
															format(date, "yyyy-MM-dd'T00:00:00Z'")
													);
												}}
											>
												<i className='far fa-trash-alt'></i>
											</button>
										)}
									</div>
								))}
							</div>
							{isBefore(today, date) && (
								<div className='btn-right'>
									<button
										className='btn btn-quaternary'
										onClick={() => {
											setAdminValues((prev) => ({
												...prev,
												toggleModal: !toggleModal,
											}));
											checkDayAvailability(
												format(date, "yyyy-MM-dd'T00:00:00Z'"),
												0,
												0
											);
										}}
									>
										<i className='fas fa-ban'></i> &nbsp; Hour Range
									</button>
								</div>
							)}
						</Fragment>
					)
				);
			case 2:
				const disable = disabledDays.some((item) => {
					const pastDate = new Date(item);
					return pastDate.getUTCDate() === date.getDate();
				});
				return (
					<Fragment>
						<h5
							className={`manage-schedule-details-title ${
								disable && 'text-danger'
							}`}
						>
							{format(date, 'MM/dd/yyyy')}
						</h5>
						<div className='btn-center'>
							{isBefore(today, date) && (
								<Fragment>
									{disable ? (
										<button
											className='btn'
											onClick={() =>
												enableDate(format(date, "yyyy-MM-dd'T00:00:00Z'"))
											}
										>
											<i className='far fa-check-circle'></i> &nbsp; Date
										</button>
									) : (
										<Fragment>
											<button
												className='btn'
												onClick={() =>
													disableDate(format(date, "yyyy-MM-dd'T00:00:00Z'"))
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
														format(date, "yyyy-MM-dd'T00:00:00Z'"),
														0,
														0
													);
												}}
											>
												<i className='fas fa-ban'></i> &nbsp; Hour Range
											</button>
										</Fragment>
									)}
								</Fragment>
							)}
						</div>
					</Fragment>
				);
			case 3:
				return (
					<Fragment>
						<h5 className='manage-schedule-details-title'>
							{format(date[0], 'MM/dd/yyyy')} - {format(date[1], 'MM/dd/yyyy')}
						</h5>

						<div className='btn-center'>
							<button
								className='btn'
								onClick={async () => {
									const answer = await disableDateRange(
										format(date[0], "yyyy-MM-dd'T00:00:00Z'"),
										format(date[1], "yyyy-MM-dd'T23:59:59Z'")
									);

									setAdminValues((prev) => ({
										...prev,
										range: !range,
										date: answer ? date[0] : [date[0], date[0]],
										tab: 0,
									}));
								}}
							>
								<i className='fas fa-ban'></i> &nbsp; Date Range
							</button>
						</div>
					</Fragment>
				);
			default:
				break;
		}
	};

	return (
		<div className='list manage-schedule'>
			{toggleReservation && (
				<PopUp
					type='schedule'
					clearJobs={clearJobsXReservations}
					toUpdate={reservation}
					toggleModal={toggleReservation}
					setToggleModal={() =>
						setAdminValues((prev) => ({
							...prev,
							toggleReservation: !toggleReservation,
							reservation: null,
						}))
					}
				/>
			)}
			<PopUp
				type='hour'
				toggleModal={toggleModal}
				confirm={async ({ hourFrom, hourTo }) => {
					const answer = await disableHourRange(
						{
							hourFrom: format(
								setHours(date, hourFrom),
								"yyyy-MM-dd'T'HH':00:00Z'"
							),
							hourTo: format(
								setHours(date, hourTo - 1),
								"yyyy-MM-dd'T'HH':00:00Z'"
							),
							user: loggedUser.id,
						},
						reservations.length === 0 && format(date, "yyyy-MM-dd'T00:00:00Z'")
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
						minDate={new Date(2021, 10, 1)}
						maxDate={addYears(today, 1)}
						onActiveStartDateChange={(e) => {
							if (e.view === 'month' || e.view === 'year') {
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
					<div className='manage-schedule-color-guide'>
						<p className='manage-schedule-color-item '>
							<i className='fas fa-square reserved'></i> Reserved Days
						</p>
						<p className='manage-schedule-color-item'>
							<i className='fas fa-square disabled'></i> Disabled Days
						</p>
						<p className='manage-schedule-color-item'>
							<i className='fas fa-square partially-disabled'></i> Partially
							Disabled Days
						</p>
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
	job: state.job,
});

export default connect(mapStateToProps, {
	checkMonthSchedule,
	checkDayAvailability,
	loadReservations,
	disableDate,
	enableDate,
	disableDateRange,
	disableHourRange,
	clearUsers,
	clearReservations,
	deleteReservation,
	loadJobs,
	clearJobsXReservations,
})(ManageSchedule);
