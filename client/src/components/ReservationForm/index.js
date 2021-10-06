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
	job: { jobs },
	auth: { loggedUser },
}) => {
	const [adminValues, setAdminValues] = useState({
		job: jobId ? Number(jobId) : '',
		user: null,
		searchDisplay: false,
	});

	const { job, user, searchDisplay } = adminValues;

	useEffect(() => {
		if (reservation)
			setAdminValues((prev) => ({
				...prev,
				job: reservation.job.id,
				user: reservation.user,
			}));
		else
			setAdminValues((prev) => ({
				...prev,
				job: '',
				user: null,
			}));
	}, [reservation]);

	const onChange = (e) => {
		setAdminValues((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const restart = () => {
		setAdminValues({
			job: '',
			user: null,
		});
	};

	return (
		<div className='reservation-form'>
			<div className='reservation-form__group'>
				<h4 className='heading-primary-subheading'>
					{reservation ? 'Update' : 'New'} Reservation
				</h4>
				{reservation && (
					<>
						<p className='heading-primary-subheading-update'>
							<Moment
								date={reservation.hourFrom}
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
							setAdminValues({ job, user: user ? user.id : null });
						}}
						reservationUser={reservation ? user : null}
						searchDisplay={searchDisplay}
						switchDisplay={(show) =>
							setAdminValues((prev) => ({ ...prev, searchDisplay: show }))
						}
					/>
				)}
				<div className='form__group'>
					<select
						className={`form__input ${job === '' ? 'empty' : ''}`}
						id='job'
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

			{job !== '' &&
				((reservation && reservation.status !== 'canceled') ||
					!reservation) && (
					<Schedule
						job={jobs[jobs.findIndex((item) => item.id === Number(job))]}
						complete={() => {
							restart();
							complete();
						}}
						reservation={reservation}
						userId={loggedUser.type === 'admin' ? user : null}
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
