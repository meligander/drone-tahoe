import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Moment from 'react-moment';

import { updateReservation } from '../../actions/reservation';

import Schedule from '../Schedule';
import UserField from '../UserField';

import './ReservationForm.scss';

const ReservationForm = ({
	reservation,
	complete,
	match,
	job: { jobs: jobsList },
	auth: { loggedUser },
	updateReservation,
}) => {
	const [formData, setFormData] = useState({
		id: 0,
		jobs: [''],
		user: null,
		address: '',
		comments: '',
		value: '',
	});

	const [adminValues, setAdminValues] = useState({
		searchDisplay: false,
		clear: false,
		changeDate: false,
	});

	const { searchDisplay, clear, changeDate } = adminValues;
	const { jobs, user, address, comments, value } = formData;

	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			jobs: reservation
				? reservation.jobs
				: [
						match.params.job_id && match.params.job_id !== '0'
							? match.params.job_id
							: '',
				  ],
			...(reservation && {
				user: reservation.user,
				address: reservation.address,
				value: reservation.value,
			}),
		}));
	}, [reservation, match]);

	const onChange = (e) => {
		let newArray = jobs;
		if (e.target.name === 'jobs')
			newArray[e.target.id] = Number(e.target.value);

		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.name === 'jobs' ? newArray : e.target.value,
		}));
	};

	const restart = () => {
		setFormData({
			id: 0,
			jobs: [''],
			user: null,
			comments: '',
			address: '',
			value: '',
		});
		setAdminValues({
			clear: true,
		});
	};

	return (
		<div className='reservation-form'>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					const answer = await updateReservation(reservation.id, formData);
					if (answer) complete();
				}}
			>
				{loggedUser.type === 'customer' && (
					<div className='btn-top-right'>
						<button
							className='reservation-form-cancel'
							onClick={(e) => {
								e.preventDefault();
								restart();
								complete();
							}}
						>
							<i className='fas fa-times'></i>
						</button>
					</div>
				)}
				<div className='reservation-form-inner'>
					<h4 className='heading-primary-subheading'>
						{reservation ? 'Update' : 'New'} Reservation:
					</h4>
					{reservation && (
						<p className='heading-primary-subheading-update'>
							<Moment
								date={reservation.hourFrom}
								utc
								className='date'
								format='MM-DD-YY'
							/>{' '}
							&nbsp;
							<Moment date={reservation.hourFrom} utc format='h a' /> -{' '}
							<Moment date={reservation.hourTo} utc format='h a' />
						</p>
					)}

					{reservation && loggedUser && loggedUser.type === 'admin' && (
						<>
							<p className='reservation-form-item'>
								<span className='reservation-form-title'>Status:</span>{' '}
								{reservation.status.charAt(0).toUpperCase() +
									reservation.status.slice(1)}
							</p>
							{reservation.state !== 'unpaid' ||
								(reservation.state !== 'requested' && (
									<>
										<p className='reservation-form-item'>
											<span className='reservation-form-title'>
												Payment method:
											</span>{' '}
											{reservation.paymentId !== '' ? 'Paypal' : 'Cash'}
										</p>
										{reservation.paymentId !== '' && (
											<p className='reservation-form-item'>
												<span className='reservation-form-title'>
													PayPal ID:
												</span>{' '}
												{reservation.paymentId}
											</p>
										)}
									</>
								))}
						</>
					)}

					{loggedUser && loggedUser.type === 'admin' && (
						<UserField
							selectFinalUser={(user) => {
								setFormData((prev) => ({
									...prev,
									user: user ? user.id : null,
								}));
							}}
							reservationUser={reservation ? user : null}
							searchDisplay={searchDisplay}
							switchDisplay={(show) =>
								setAdminValues((prev) => ({ ...prev, searchDisplay: show }))
							}
							clear={clear}
							completeClear={() =>
								setAdminValues((prev) => ({ ...prev, clear: false }))
							}
						/>
					)}
					<div className='form__group'>
						<input
							className='form__input'
							type='text'
							value={address}
							onChange={onChange}
							disabled={
								reservation &&
								reservation.status !== 'requested' &&
								((loggedUser.type === 'customer' &&
									reservation.status === 'unpaid') ||
									loggedUser.type !== 'customer')
							}
							id='address'
							name='address'
							placeholder='Address for the Job'
						/>
						<label htmlFor='address' className='form__label'>
							Address for the Job
						</label>
					</div>
					<div className='jobs-list'>
						<p className='jobs-list-title'>Jobs List</p>
						{jobs.length > 0 &&
							jobs.map((job, i) => (
								<div className='form__group-job' key={i}>
									<div className='form__group'>
										<select
											className={`form__input ${job === '' ? 'empty' : ''}`}
											id={i}
											name='jobs'
											value={job}
											disabled={
												reservation &&
												reservation.status !== 'requested' &&
												((loggedUser.type === 'customer' &&
													reservation.status === 'unpaid') ||
													loggedUser.type !== 'customer')
											}
											onFocus={() =>
												setAdminValues((prev) => ({
													...prev,
													searchDisplay: false,
												}))
											}
											onChange={onChange}
										>
											<option value=''>* Job {i + 1}</option>
											{jobsList.length > 0 &&
												jobsList.map((item) => (
													<option key={`jl-${i}-${item.id}`} value={item.id}>
														{item.title}
													</option>
												))}
										</select>
										<label
											htmlFor='job'
											className={`form__label ${job === '' ? 'hide' : ''}`}
										>
											Job {i + 1}
										</label>
									</div>
									<button
										className='btn-icon'
										onClick={() => {
											jobs.splice(i, 1);
											setFormData((prev) => ({
												...prev,
												jobs,
											}));
										}}
									>
										<i className='far fa-trash-alt'></i>
									</button>
								</div>
							))}
						<div className='btn-right'>
							<button
								className='btn btn-quaternary'
								onClick={(e) => {
									e.preventDefault();
									setFormData((prev) => ({ ...prev, jobs: [...jobs, ''] }));
								}}
							>
								<i className='fas fa-plus'></i> &nbsp; Job
							</button>
						</div>
					</div>
					<div className='form__group'>
						<textarea
							type='text'
							className='form__input textarea'
							value={comments}
							id='comments'
							disabled={
								reservation &&
								reservation.status !== 'unpaid' &&
								reservation.status !== 'requested'
							}
							rows='3'
							onChange={onChange}
							placeholder='Special Request'
							name='comments'
						/>
						<label htmlFor='comments' className='form__label'>
							Special Request
						</label>
					</div>
					{(loggedUser.type === 'admin' ||
						(loggedUser.type === 'customer' &&
							value !== 0 &&
							value !== '')) && (
						<div className='form__group'>
							<input
								className='form__input'
								type='text'
								value={value}
								onChange={onChange}
								disabled={
									(reservation &&
										reservation.status !== 'unpaid' &&
										reservation.status !== 'requested') ||
									loggedUser.type === 'customer'
								}
								id='value'
								name='value'
								placeholder='Value'
							/>
							<label htmlFor='address' className='form__label'>
								Value
							</label>
						</div>
					)}

					{reservation && (
						<div className='btn-center'>
							{!changeDate && (
								<button className='btn' type='submit'>
									<i className='far fa-save'></i>
								</button>
							)}

							{reservation.status !== 'canceled' &&
								reservation.status !== 'refunded' && (
									<button
										className='btn'
										onClick={(e) => {
											e.preventDefault();
											setAdminValues((prev) => ({
												...prev,
												changeDate: !changeDate,
											}));
										}}
									>
										{changeDate ? 'Keep Date' : 'Change Date'}
									</button>
								)}
						</div>
					)}
				</div>
			</form>
			{(changeDate || !reservation) && (
				<Schedule
					complete={() => {
						restart();
						complete();
					}}
					reservation={reservation ? reservation : formData}
				/>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	job: state.job,
	auth: state.auth,
});

export default connect(mapStateToProps, { updateReservation })(
	withRouter(ReservationForm)
);
