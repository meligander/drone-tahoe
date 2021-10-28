import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

import {
	loadReservations,
	deleteReservation,
	cancelReservation,
} from '../../../actions/reservation';
import { clearUsers } from '../../../actions/user';
import { loadJobs } from '../../../actions/jobs';

import PopUp from '../../layouts/PopUp';
import Alert from '../../layouts/Alert';

import UserField from '../../UserField';

const ReservationsList = ({
	deleteReservation,
	loadReservations,
	cancelReservation,
	loadJobs,
	reservation: { reservations, error, loading },
	job: { jobs: jobList },
	clearUsers,
}) => {
	const initialValue = {
		hourFrom: '',
		hourTo: '',
		user: '',
		status: '',
	};
	const [formData, setFormData] = useState(initialValue);

	const [adminValues, setAdminValues] = useState({
		toggleDeleteConf: false,
		toggleReservation: false,
		toggleRefund: false,
		showFilter: false,
		reservation: null,
		searchDisplay: false,
		clear: false,
		checkout: false,
	});

	const { hourFrom, hourTo, status } = formData;

	const {
		toggleDeleteConf,
		toggleReservation,
		toggleRefund,
		showFilter,
		reservation,
		searchDisplay,
		clear,
		checkout,
	} = adminValues;

	useEffect(() => {
		if (loading) {
			loadJobs({}, true);
			loadReservations({ hourFrom: new Date() }, true);
		}
	}, [loading, loadReservations, loadJobs]);

	const onChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const onSubmit = (e) => {
		e.preventDefault();
		setFormData(initialValue);
		loadReservations(formData, false);
		setAdminValues((prev) => ({ ...prev, clear: true }));
	};

	const completeClear = () => {
		setAdminValues((prev) => ({ ...prev, clear: false }));
	};

	return (
		<div className='list'>
			<PopUp
				type='confirmation'
				confirm={() => cancelReservation(reservation)}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleRefund: !toggleRefund,
						reservation: null,
					}))
				}
				toggleModal={toggleRefund}
				text='Are you sure you want to refund the payment for this reservation?'
			/>
			<PopUp
				type='confirmation'
				confirm={() => deleteReservation(reservation)}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleDeleteConf: !toggleDeleteConf,
						reservation: null,
					}))
				}
				toggleModal={toggleDeleteConf}
				text='Are you sure you want to delete the reservation?'
				subtext={
					reservation &&
					reservation.paymentId !== '' &&
					reservation.status === 'paid' &&
					'A paypal refund should be made before deleting it.'
				}
			/>
			<PopUp
				type='payment'
				toUpdate={
					reservation && {
						...reservation,
						jobs: reservation.jobs.map((item) =>
							jobList.find((job) => job.id === item)
						),
					}
				}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						checkout: false,
						reservation: null,
					}))
				}
				toggleModal={checkout}
			/>
			{toggleReservation && (
				<PopUp
					type='schedule'
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

			<h2 className='heading-primary'>Reservations</h2>

			<Alert type='1' />
			<form className='form filter' onSubmit={onSubmit}>
				<p className='filter-title'>Filter</p>

				<button
					className='filter-icon'
					onClick={(e) => {
						e.preventDefault();
						setAdminValues((prev) => ({ ...prev, showFilter: !showFilter }));
					}}
				>
					{showFilter ? (
						<i className='fas fa-chevron-up'></i>
					) : (
						<i className='fas fa-chevron-down'></i>
					)}
				</button>
				<div className={`filter-content ${!showFilter ? 'hide' : ''}`}>
					<div className='form__group'>
						<div className='form__group-sub'>
							<div className='form__group-sub-item'>
								<input
									type='date'
									className='form__input'
									id='hourFrom'
									value={hourFrom}
									onChange={onChange}
									onFocus={() =>
										setAdminValues((prev) => ({
											...prev,
											searchDisplay: false,
										}))
									}
								/>
								<label htmlFor='hourFrom' className='form__label'>
									From
								</label>
							</div>
							<div className='form__group-sub-item'>
								<input
									type='date'
									className='form__input'
									id='hourTo'
									onChange={onChange}
									value={hourTo}
									onFocus={() =>
										setAdminValues((prev) => ({
											...prev,
											searchDisplay: false,
										}))
									}
								/>
								<label htmlFor='hourTo' className='form__label'>
									To
								</label>
							</div>
						</div>
					</div>

					<UserField
						selectFinalUser={(user) => {
							setFormData((prev) => ({ ...prev, user: user ? user.id : '' }));
							setAdminValues((prev) => ({ ...prev, searchDisplay: false }));
						}}
						searchDisplay={searchDisplay}
						switchDisplay={(show) =>
							setAdminValues((prev) => ({ ...prev, searchDisplay: show }))
						}
						clear={clear}
						completeClear={completeClear}
						autoComplete='off'
					/>
					<div className='form__group'>
						<select
							className={`form__input ${status === '' ? 'empty' : ''}`}
							id='status'
							value={status}
							onChange={onChange}
							onFocus={() =>
								setAdminValues((prev) => ({
									...prev,
									searchDisplay: false,
								}))
							}
						>
							<option value=''>* Status</option>
							<option value='requested'>Requested</option>
							<option value='unpaid'>Unpaid</option>
							<option value='pending'>Pending</option>
							<option value='paid'>Paid</option>
							<option value='canceled'>Canceled</option>
							<option value='completed'>Completed</option>
						</select>
						<label
							htmlFor='staus'
							className={`form__label ${status === '' ? 'hide' : ''}`}
						>
							Status
						</label>
					</div>

					<button type='submit' className='btn btn-tertiary'>
						<i className='fas fa-search'></i>&nbsp; Search
					</button>
				</div>
			</form>
			{!loading && (
				<>
					{reservations.length > 0 ? (
						<>
							<div className='wrapper'>
								<table className='icon-6'>
									<thead>
										<tr>
											<th>Date</th>
											<th>From</th>
											<th>To</th>
											<th>User</th>
											<th>Status</th>
											<th></th>
											<th></th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{reservations.map((res) => (
											<tr key={res.id}>
												<td>
													<Moment date={res.hourFrom} utc format='MM/DD/YY' />
												</td>
												<td>
													<Moment date={res.hourFrom} utc format='h a' />
												</td>
												<td>
													<Moment date={res.hourTo} utc format='h a' />
												</td>
												<td>
													<Link
														onClick={() => {
															clearUsers();
															window.scrollTo(0, 0);
														}}
														className='btn-link text-dark'
														to={`/edit-user/${res.user.id}`}
													>{`${res.user.name} ${res.user.lastname}`}</Link>
												</td>
												<td>
													{res.status.charAt(0).toUpperCase() +
														res.status.slice(1)}
												</td>
												<td>
													{res.status === 'unpaid' && (
														<button
															className='btn-icon'
															onClick={() =>
																setAdminValues((prev) => ({
																	...prev,
																	checkout: true,
																	reservation: res,
																}))
															}
														>
															<i className='fas fa-dollar-sign'></i>
														</button>
													)}
													{res.status === 'paid' && res.paymentId && (
														<button
															className='btn-icon'
															onClick={() =>
																setAdminValues((prev) => ({
																	...prev,
																	toggleRefund: true,
																	reservation: res,
																}))
															}
														>
															<i className='fas fa-redo-alt'></i>
														</button>
													)}
												</td>
												<td>
													<button
														className='btn-icon'
														onClick={() =>
															setAdminValues((prev) => ({
																...prev,

																toggleReservation: !toggleReservation,
																reservation: res,
															}))
														}
													>
														{res.status !== 'refunded' &&
														res.status !== 'completed' &&
														res.status !== 'canceled' ? (
															<i className='far fa-edit'></i>
														) : (
															<i className='fas fa-search'></i>
														)}
													</button>
												</td>
												<td>
													<button
														className='btn-icon'
														onClick={() =>
															setAdminValues((prev) => ({
																...prev,
																toggleDeleteConf: !toggleDeleteConf,
																reservation: res,
															}))
														}
													>
														<i className='far fa-trash-alt'></i>
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className='list-total'>
								<span className='list-total-title text-dark'>Total:</span>
								&nbsp;
								{reservations.length}
							</div>
						</>
					) : (
						<h3 className='heading-primary-subheading u-center-text text-danger'>
							{error.msg}
						</h3>
					)}
					<div className='btn-right'>
						<button
							onClick={() =>
								setAdminValues((prev) => ({
									...prev,
									toggleReservation: !toggleReservation,
								}))
							}
							className='btn btn-primary'
						>
							<i className='fas fa-plus'></i> &nbsp; Reservation
						</button>
					</div>
				</>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	reservation: state.reservation,
	job: state.job,
});

export default connect(mapStateToProps, {
	loadReservations,
	deleteReservation,
	cancelReservation,
	clearUsers,
	loadJobs,
})(ReservationsList);
