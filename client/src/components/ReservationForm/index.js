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
	});

	const { job, user } = adminValues;

	useEffect(() => {
		if (reservation)
			setAdminValues((prev) => ({
				...prev,
				job: reservation.job.id,
				user: reservation.user,
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
				{loggedUser.type === 'admin' && (
					<UserField
						selectFinalUser={(user) => {
							setAdminValues({ job, user: user.id });
						}}
						reservationUser={user}
					/>
				)}
				<div className='form__group'>
					{!reservation && (
						<label htmlFor='job' className='form__label'>
							Select the Type of Job for the New Reservation:
						</label>
					)}

					<select
						className='form__input'
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
				</div>
			</div>
			{job !== '' && (
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
