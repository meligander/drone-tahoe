import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Moment from 'react-moment';

import Schedule from '../Schedule';

import './ReservationForm.scss';
import UserField from '../UserField';

const ReservationForm = ({
	reservation,
	complete,
	jobId,
	job: { jobs: jobsList },
	auth: { loggedUser },
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
	});

	const { searchDisplay, clear } = adminValues;
	const { jobs, user, address, comments, value } = formData;

	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			jobs: reservation ? reservation.jobs : [jobId ? jobId : ''],
			user: reservation ? reservation.user : null,
		}));
	}, [reservation, jobId]);

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
			<div className='reservation-form__group'>
				<h4 className='heading-primary-subheading'>
					{reservation ? 'Update' : 'New'} Reservation:
				</h4>
				{reservation && (
					<>
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
						{loggedUser.type === 'customer' && (
							<button
								className='reservation-form-cancel'
								onClick={() => {
									complete();
									restart();
								}}
							>
								<i className='fas fa-times'></i>
							</button>
						)}
					</>
				)}

				{loggedUser && loggedUser.type === 'admin' && (
					<UserField
						selectFinalUser={(user) => {
							setFormData((prev) => ({ ...prev, user: user ? user.id : null }));
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
										disabled={reservation}
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
							onClick={() =>
								setFormData((prev) => ({ ...prev, jobs: [...jobs, ''] }))
							}
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
						rows='3'
						onChange={onChange}
						placeholder='Special Request'
						name='comments'
					/>
					<label htmlFor='comments' className='form__label'>
						Special Request
					</label>
				</div>
				{loggedUser.type === 'admin' && (
					<div className='form__group'>
						<input
							className='form__input'
							type='text'
							value={value}
							onChange={onChange}
							id='value'
							name='value'
							placeholder='Value'
						/>
						<label htmlFor='address' className='form__label'>
							Value
						</label>
					</div>
				)}
				{reservation && loggedUser && loggedUser.type === 'admin' && (
					<>
						<p className='reservation-form-item'>
							<span className='reservation-form-title'>Payment method:</span>{' '}
							{reservation.paymentId !== '' ? 'Paypal' : 'Cash'}
						</p>
						{reservation.paymentId !== '' && (
							<p className='reservation-form-item'>
								<span className='reservation-form-title'>PayPal ID:</span>{' '}
								{reservation.paymentId}
							</p>
						)}
					</>
				)}
			</div>

			{((reservation && reservation.status !== 'canceled') || !reservation) && (
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

export default connect(mapStateToProps)(ReservationForm);
