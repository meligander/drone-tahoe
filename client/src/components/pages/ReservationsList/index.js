import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

import {
	loadReservations,
	deleteReservation,
	updateStatus,
} from '../../../actions/reservation';
import { loadJobs } from '../../../actions/jobs';
import { clearUsers } from '../../../actions/user';

import PopUp from '../../layouts/PopUp';
import Alert from '../../layouts/Alert';

import UserField from '../../UserField';

const ReservationsList = ({
	deleteReservation,
	loadReservations,
	loadJobs,
	job: { jobs },
	reservation: { reservations, error, loading },
	clearUsers,
	updateStatus,
}) => {
	const initialValue = {
		hourFrom: '',
		hourTo: '',
		user: '',
		job: '',
	};
	const [formData, setFormData] = useState(initialValue);

	const [adminValues, setAdminValues] = useState({
		toggleDeleteConf: false,
		toggleReservation: false,
		showFilter: false,
		reservation: null,
		update: false,
		searchDisplay: false,
		clear: false,
	});

	const { hourFrom, hourTo, job } = formData;

	const {
		toggleDeleteConf,
		toggleReservation,
		showFilter,
		reservation,
		update,
		searchDisplay,
		clear,
	} = adminValues;

	useEffect(() => {
		if (loading) {
			updateStatus();
			loadJobs({}, true);
			loadReservations({ hourFrom: new Date() }, true);
		}
	}, [loading, loadReservations, loadJobs, updateStatus]);

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
				confirm={() => deleteReservation(reservation.id)}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleDeleteConf: !toggleDeleteConf,
					}))
				}
				toggleModal={toggleDeleteConf}
				text='Are you sure you want to delete the reservation?'
				subtext={
					reservation &&
					reservation.paymentId !== '' &&
					'A paypal refund should be made before deleting it.'
				}
			/>
			<PopUp
				type='schedule'
				toUpdate={update ? reservation : null}
				toggleModal={toggleReservation}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleReservation: !toggleReservation,
					}))
				}
			/>
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
					/>
					<div className='form__group'>
						<select
							className={`form__input ${job === '' ? 'empty' : ''}`}
							id='job'
							value={job}
							onChange={onChange}
							onFocus={() =>
								setAdminValues((prev) => ({
									...prev,
									searchDisplay: false,
								}))
							}
						>
							<option value=''>* Type of Job</option>
							{jobs.length > 0 &&
								jobs.map((job) => (
									<option key={job.id} value={job.id}>
										{job.title}
									</option>
								))}
						</select>
						<label
							htmlFor='job'
							className={`form__label ${job === '' ? 'hide' : ''}`}
						>
							Type of Job
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
						<div>
							<div className='wrapper'>
								<table className='icon-7'>
									<thead>
										<tr>
											<th>Date</th>
											<th>From</th>
											<th>To</th>
											<th>User</th>
											<th>Job</th>
											<th>Status</th>
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
														onClick={clearUsers}
														className='btn-link text-dark'
														to={`/edit-user/${res.user.id}`}
													>{`${res.user.name} ${res.user.lastname}`}</Link>
												</td>
												<td>{res.job.title}</td>
												<td>
													{res.status.charAt(0).toUpperCase() +
														res.status.slice(1)}
												</td>
												<td>
													<button
														className='btn-icon'
														onClick={() =>
															setAdminValues((prev) => ({
																...prev,
																toggleReservation: !toggleReservation,
																reservation: res,
																update: true,
															}))
														}
													>
														<i className='far fa-edit'></i>
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
						</div>
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
									update: false,
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
	loadJobs,
	clearUsers,
	updateStatus,
})(ReservationsList);
