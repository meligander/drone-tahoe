import React, { useEffect, useState, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import {
	loadReservations,
	deleteReservation,
	cancelReservation,
} from '../../../actions/reservation';
import { clearUsers } from '../../../actions/user';
import { loadJobs } from '../../../actions/jobs';
import { clearJobsXReservations } from '../../../actions/jobsXReservations';

import PopUp from '../../layouts/PopUp';
import Alert from '../../layouts/Alert';

import UserField from '../../UserField';
import DatesFiled from '../../DatesFiled';

const ReservationsList = ({
	deleteReservation,
	loadReservations,
	cancelReservation,
	loadJobs,
	reservation: { reservations, error, loading },
	clearUsers,
	clearJobsXReservations,
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
		e.persist();
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

	const setToggle = (type) => {
		setAdminValues((prev) => ({ ...prev, [type]: ![type], reservation: null }));
	};

	return (
		<div className='list'>
			<PopUp
				type='refund'
				toUpdate={reservation}
				confirm={async (formData) => {
					const answer = await cancelReservation(reservation, formData);

					if (answer)
						setAdminValues((prev) => ({
							...prev,
							toggleRefund: !toggleRefund,
						}));
				}}
				setToggleModal={() => setToggle('toggleRefund')}
				toggleModal={toggleRefund}
			/>
			<PopUp
				type='confirmation'
				confirm={() => deleteReservation(reservation)}
				setToggleModal={() => setToggle('toggleDeleteConf')}
				toggleModal={toggleDeleteConf}
				text='Are you sure you want to delete the reservation?'
				subtext={
					reservation &&
					reservation.paymentId !== '' &&
					reservation.status === 'paid' &&
					'A refund should be made before deleting it.'
				}
			/>
			{checkout && (
				<PopUp
					type='payment'
					clearJobs={clearJobsXReservations}
					toUpdate={reservation && reservation}
					setToggleModal={() => setToggle('checkout')}
					toggleModal={checkout}
				/>
			)}

			{toggleReservation && (
				<PopUp
					type='schedule'
					clearJobs={clearJobsXReservations}
					toUpdate={reservation}
					toggleModal={toggleReservation}
					setToggleModal={() => setToggle('toggleReservation')}
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
					<DatesFiled
						onFocus={() =>
							setAdminValues((prev) => ({
								...prev,
								searchDisplay: false,
							}))
						}
						hourFrom={hourFrom}
						hourTo={hourTo}
						onChange={onChange}
					/>
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
							<option value='completed'>Completed</option>
							<option value='canceled'>Canceled</option>
							<option value='refunded'>Refunded</option>
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
				<Fragment>
					{reservations.length > 0 ? (
						<Fragment>
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
													{format(
														new Date(res.hourFrom.slice(0, -1)),
														'MM/dd/yy'
													)}
												</td>
												<td>
													{format(new Date(res.hourFrom.slice(0, -1)), 'h aaa')}
												</td>
												<td>
													{format(new Date(res.hourTo.slice(0, -1)), 'h aaa')}
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
														<div className='tooltip'>
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
															<span className='tooltiptext'>Pay</span>
														</div>
													)}
													{res.status === 'paid' && (
														<div className='tooltip'>
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
															<span className='tooltiptext'>Refund</span>
														</div>
													)}
												</td>
												<td>
													<div className='tooltip'>
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
														<span className='tooltiptext'>
															{res.status !== 'refunded' &&
															res.status !== 'completed' &&
															res.status !== 'canceled'
																? 'Edit'
																: 'See details'}
														</span>
													</div>
												</td>
												<td>
													<div className='tooltip'>
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
														<span className='tooltiptext'>Delete</span>
													</div>
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
						</Fragment>
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
				</Fragment>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	reservation: state.reservation,
});

export default connect(mapStateToProps, {
	loadReservations,
	deleteReservation,
	cancelReservation,
	clearUsers,
	loadJobs,
	clearJobsXReservations,
})(ReservationsList);
