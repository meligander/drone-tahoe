import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Moment from 'react-moment';

import { updateReservation } from '../../actions/reservation';

import Schedule from '../Schedule';
import UserField from '../UserField';
import Alert from '../layouts/Alert';

import './ReservationForm.scss';

const ReservationForm = ({
	reservation,
	setToggleModal,
	match,
	job: { jobs: jobsList },
	auth: { loggedUser },
	updateReservation,
}) => {
	const form = useRef();
	const schedule = useRef();

	const disabled =
		reservation &&
		reservation.status !== 'requested' &&
		((loggedUser.type === 'customer' && reservation.status === 'unpaid') ||
			reservation.status !== 'unpaid');

	const [formData, setFormData] = useState({
		id: 0,
		jobs: [
			{
				id: 0,
				job:
					match.params.job_id && match.params.job_id !== '0'
						? match.params.job_id
						: '',
				value: '',
				discount: null,
			},
		],
		user: null,
		address: '',
		comments: '',
	});

	const [adminValues, setAdminValues] = useState({
		searchDisplay: false,
		clear: false,
		changeDate: false,
		total: 0,
	});

	const { searchDisplay, clear, changeDate, total } = adminValues;
	const { id, jobs, user, address, comments } = formData;

	useEffect(() => {
		if (reservation) {
			if (id !== reservation.id) {
				setFormData({
					id: reservation.id,
					hourFrom: reservation.hourFrom,
					hourTo: reservation.hourTo,
					//Jobs
					//jobs: reservation.jobs,
					user: reservation.user,
					address: reservation.address,
					status: reservation.status,
					comments: reservation.comments ? reservation.comments : '',
				});
			}
		}
	}, [reservation, id]);

	const onChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const getTotal = () => {
		const total = jobs.reduce((sum, item) => {
			let itemValue = Number(item.value);
			if (item.discount !== null) itemValue = itemValue - Number(item.discount);
			return sum + itemValue;
		}, 0);

		setAdminValues((prev) => ({ ...prev, total }));
	};

	const onChangeJobs = (e) => {
		if (
			e.target.name === 'job' ||
			(e.target.name === 'value' &&
				Number(jobs[e.target.id].discount) <= Number(e.target.value)) ||
			(e.target.name === 'discount' &&
				Number(jobs[e.target.id].value >= Number(e.target.value)))
		) {
			jobs[e.target.id][e.target.name] = e.target.value;

			if (e.target.name !== 'job') getTotal();

			setFormData((prev) => ({
				...prev,
				jobs,
			}));
		}
	};

	const jobListItem = (job, i) => {
		const index = jobs.findIndex((j) => Number(j.job) === job.id);

		if (index === -1 || index === i)
			return <option value={job.id}>{job.title}</option>;
	};

	return (
		<div
			className={`reservation-form ${
				loggedUser.type === 'customer' ? 'border' : ''
			}`}
		>
			<form
				ref={form}
				onSubmit={async (e) => {
					e.preventDefault();
					const answer = await updateReservation(formData);
					if (answer) setToggleModal();
					else form.current.scrollIntoView();
				}}
			>
				{loggedUser.type === 'customer' && (
					<div className='btn-top-right'>
						<button
							className='reservation-form-cancel'
							onClick={(e) => {
								e.preventDefault();
								setToggleModal(); /* 
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
								}); */
							}}
						>
							<i className='fas fa-times'></i>
						</button>
					</div>
				)}
				<div className='reservation-form-inner'>
					<h4 className='heading-primary-subheading'>
						{!reservation
							? 'New'
							: reservation &&
							  reservation.status !== 'canceled' &&
							  reservation.status !== 'refunded' &&
							  reservation.status !== 'completed'
							? 'Update'
							: ''}{' '}
						Reservation:
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
					{!changeDate && reservation && <Alert type='2' />}
					{reservation && loggedUser && loggedUser.type === 'admin' && (
						<>
							<p className='reservation-form-item'>
								<span className='reservation-form-title'>Status:</span>{' '}
								{reservation.status.charAt(0).toUpperCase() +
									reservation.status.slice(1)}
							</p>
							{reservation.status !== 'unpaid' &&
								reservation.status !== 'requested' && (
									<>
										<p className='reservation-form-item'>
											<span className='reservation-form-title'>
												Payment method:
											</span>{' '}
											{reservation.paymentId ? 'Paypal' : 'Cash'}
										</p>
										{reservation.paymentId && (
											<p className='reservation-form-item'>
												<span className='reservation-form-title'>
													PayPal ID:
												</span>{' '}
												{reservation.paymentId}
											</p>
										)}
									</>
								)}
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
							autoComplete='new-password'
						/>
					)}
					<div className='form__group'>
						<input
							className='form__input'
							type='text'
							value={address}
							onChange={onChange}
							disabled={disabled}
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
							jobs.map((item, i) => (
								<div className='jobs-list-item' key={i}>
									<div className='jobs-list-item-group'>
										<p className='jobs-list-item-title'>Job {i + 1}</p>
										<div className='form__group'>
											<select
												className={`form__input ${
													item.job === '' ? 'empty' : ''
												}`}
												id={i}
												name='job'
												value={item.job}
												disabled={disabled}
												onFocus={() =>
													setAdminValues((prev) => ({
														...prev,
														searchDisplay: false,
													}))
												}
												onChange={onChangeJobs}
											>
												<option value=''>* Type of Job</option>
												{jobsList.length > 0 &&
													jobsList.map((job) => (
														<React.Fragment key={`jl-${i}-${job.id}`}>
															{jobListItem(job, i)}
														</React.Fragment>
													))}
											</select>
											<label
												htmlFor='item'
												className={`form__label ${
													item.job === '' ? 'hide' : ''
												}`}
											>
												Type of Job
											</label>
										</div>
										<div className='form__group'>
											<input
												className='form__input'
												type='text'
												value={item.value}
												onChange={onChangeJobs}
												disabled={disabled}
												id={i}
												name='value'
												placeholder='Price'
											/>
											<label htmlFor={i} className='form__label'>
												Price
											</label>
										</div>
										<div
											className={`form__group ${
												item.discount === null ? 'hide' : ''
											}`}
										>
											<input
												className='form__input'
												type='text'
												value={item.discount !== null ? item.discount : ''}
												onChange={onChangeJobs}
												disabled={disabled}
												id={i}
												name='discount'
												placeholder='Discount'
											/>
											<label htmlFor={i} className='form__label'>
												Discount
											</label>
										</div>

										<div className='form__group switch'>
											<label
												className='form__label-switch'
												htmlFor='discountChk'
											>
												Discount
											</label>
											<input
												checked={item.discount !== null}
												type='checkbox'
												id='discountChk'
												name='discountChk'
												onChange={() => {
													jobs[i].discount = item.discount !== null ? null : '';

													if (jobs[i].discount === null) getTotal();

													setFormData((prev) => ({ ...prev, jobs }));
												}}
												className='form__input-switch'
											/>
										</div>
									</div>
									{!disabled && (
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
									)}
								</div>
							))}
						{(!reservation ||
							(reservation &&
								(reservation.status === 'requested' ||
									(loggedUser.type === 'admin' &&
										reservation.status === 'unpaid')))) && (
							<div className='btn-right'>
								<button
									className='btn btn-quaternary'
									onClick={(e) => {
										e.preventDefault();
										setFormData((prev) => ({
											...prev,
											jobs: [
												...jobs,
												{
													id: 0,
													job: '',
													value: '',
													discount: null,
												},
											],
										}));
									}}
								>
									<i className='fas fa-plus'></i> &nbsp; Job
								</button>
							</div>
						)}
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
					{total !== 0 && (
						<h4 className='reservation-form-total'>
							<span className='reservation-form-title'>Total:</span> ${total}
						</h4>
					)}

					{reservation &&
						reservation.status !== 'canceled' &&
						reservation.status !== 'refunded' &&
						reservation.status !== 'completed' && (
							<div className='btn-center'>
								{!changeDate && reservation.status !== 'paid' && (
									<button className='btn' type='submit'>
										<i className='far fa-save'></i>
									</button>
								)}

								<button
									className='btn'
									onClick={(e) => {
										e.preventDefault();
										if (!changeDate) {
											setTimeout(() => {
												schedule.current.scrollIntoView(true);
											}, 30);
										}

										setAdminValues((prev) => ({
											...prev,
											changeDate: !changeDate,
										}));
									}}
								>
									{changeDate ? 'Keep Date' : 'Change Date'}
								</button>
							</div>
						)}
				</div>
			</form>
			<div ref={schedule}>
				{(changeDate || !reservation) && (
					<Schedule setToggleModal={setToggleModal} reservation={formData} />
				)}
			</div>
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
