import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Moment from 'react-moment';

import { updateReservation } from '../../actions/reservation';
import {
	loadReservationJobs,
	clearJobsXReservations,
} from '../../actions/jobsXReservations';

import Schedule from '../Schedule';
import UserField from '../UserField';
import Alert from '../layouts/Alert';

import './ReservationForm.scss';

const ReservationForm = ({
	reservation,
	setToggleModal,
	match,
	location,
	job: { jobs: jobsList },
	auth: { loggedUser },
	jobsXreservation: { jobsXreservations, loading },
	updateReservation,
	loadReservationJobs,
	clearJobsXReservations,
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
				jobId:
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
		travelExpenses: null,
		total: '',
	});

	const [adminValues, setAdminValues] = useState({
		searchDisplay: false,
		clear: false,
		changeDate: false,
	});

	const { searchDisplay, clear, changeDate } = adminValues;
	const { id, jobs, user, address, comments, total, travelExpenses } = formData;

	useEffect(() => {
		if (reservation) {
			if (!reservation.jobs && loading) {
				loadReservationJobs(reservation.id);
			} else {
				if (id !== reservation.id) {
					setFormData({
						id: reservation.id,
						hourFrom: reservation.hourFrom,
						hourTo: reservation.hourTo,
						jobs: jobsXreservations.map((item) => {
							return { ...item, value: item.value === 0 ? '' : item.value };
						}),
						user: reservation.user,
						address: reservation.address,
						status: reservation.status,
						comments: reservation.comments ? reservation.comments : '',
						total: reservation.total ? reservation.total : '',
						travelExpenses: reservation.travelExpenses
							? reservation.travelExpenses
							: null,
					});
				}
			}
		}
	}, [reservation, id, loading, loadReservationJobs, jobsXreservations]);

	const getTotal = (expence) => {
		const total = Number(
			jobs.reduce((sum, item) => {
				let itemValue = item.value;
				if (item.discount !== null) itemValue = itemValue - item.discount;
				return sum + itemValue;
			}, 0)
		);
		return expence ? total + expence : total;
	};

	const onChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]:
				e.target.name !== 'travelExpenses'
					? e.target.value
					: !isNaN(Number(e.target.value))
					? Number(e.target.value)
					: travelExpenses,
			...(e.target.name === 'travelExpenses' &&
				!isNaN(Number(e.target.value)) && {
					total: getTotal(Number(e.target.value)),
				}),
		}));
	};

	const onChangeJobs = (e) => {
		if (
			e.target.name === 'jobId' ||
			(e.target.name === 'value' &&
				Number(jobs[e.target.id].discount) <= Number(e.target.value)) ||
			(e.target.name === 'discount' &&
				Number(jobs[e.target.id].value >= Number(e.target.value)))
		) {
			jobs[e.target.id][e.target.name] =
				e.target.name !== 'jobId' ? Number(e.target.value) : e.target.value;

			setFormData((prev) => ({
				...prev,
				jobs,
				...(e.target.name !== 'jobId' && { total: getTotal() }),
			}));
		}
	};

	const jobListItem = (job, i) => {
		const index = jobs.findIndex((j) => Number(j.jobId) === job.id);

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
					if (answer) {
						setToggleModal();
						clearJobsXReservations();
					} else form.current.scrollIntoView();
				}}
			>
				{loggedUser.type === 'customer' && (
					<div className='btn-top-right'>
						<button
							className='reservation-form-cancel'
							onClick={(e) => {
								e.preventDefault();
								setToggleModal();
								clearJobsXReservations(); /* 
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
									<div
										className={`jobs-list-item-group ${disabled ? 'full' : ''}`}
									>
										<p className='jobs-list-item-title'>Job {i + 1}</p>
										<div className='form__group'>
											<select
												className={`form__input ${
													item.jobId === '' ? 'empty' : ''
												}`}
												id={i}
												name='jobId'
												value={item.jobId}
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
													item.jobId === '' ? 'hide' : ''
												}`}
											>
												Type of Job
											</label>
										</div>
										{(loggedUser.type === 'admin' ||
											(loggedUser.type === 'customer' &&
												reservation &&
												reservation.type !== 'requested')) && (
											<>
												<div className='form__group'>
													<input
														className='form__input'
														type='text'
														value={item.value}
														onChange={onChangeJobs}
														disabled={
															disabled || loggedUser.type === 'customer'
														}
														id={i}
														name='value'
														placeholder='Value'
													/>
													<label htmlFor={i} className='form__label'>
														Value
													</label>
												</div>
												{(loggedUser.type === 'admin' ||
													(loggedUser.type === 'customer' &&
														item.discount !== null)) && (
													<div
														className={`form__group ${
															item.discount === null ? 'hide' : ''
														}`}
													>
														<input
															className='form__input'
															type='text'
															value={
																item.discount !== null ? item.discount : ''
															}
															onChange={onChangeJobs}
															disabled={
																disabled || loggedUser.type === 'customer'
															}
															id={i}
															name='discount'
															placeholder='Discount'
														/>
														<label htmlFor={i} className='form__label'>
															Discount
														</label>
													</div>
												)}

												{loggedUser.type === 'admin' &&
													((reservation &&
														(reservation.status === 'requested' ||
															reservation.status === 'unpaid')) ||
														!reservation) && (
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
																	jobs[i].discount =
																		item.discount !== null ? null : '';

																	setFormData((prev) => ({
																		...prev,
																		jobs,
																		...(jobs[i].discount === null && {
																			total: getTotal(),
																		}),
																	}));
																}}
																className='form__input-switch'
															/>
														</div>
													)}
											</>
										)}
									</div>
									{!disabled && (
										<button
											className='btn-icon'
											onClick={(e) => {
												e.preventDefault();
												jobs.splice(i, 1);
												setFormData((prev) => ({
													...prev,
													jobs,
													total: getTotal(),
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
													jobId: '',
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
					{(loggedUser.type === 'admin' ||
						(loggedUser.type === 'customer' && travelExpenses !== null)) && (
						<div
							className={`form__group ${travelExpenses === null ? 'hide' : ''}`}
						>
							<input
								className='form__input'
								type='text'
								value={travelExpenses !== null ? travelExpenses : ''}
								onChange={onChange}
								disabled={disabled || loggedUser.type === 'customer'}
								id='travelExpenses'
								name='travelExpenses'
								placeholder='Travel Expenses'
							/>
							<label htmlFor='travelExpenses' className='form__label'>
								Travel Expenses
							</label>
						</div>
					)}

					{loggedUser.type === 'admin' &&
						((reservation &&
							(reservation.status === 'requested' ||
								reservation.status === 'unpaid')) ||
							!reservation) && (
							<div className='form__group switch'>
								<label className='form__label-switch' htmlFor='travelExpChk'>
									Travel Expenses
								</label>
								<input
									checked={travelExpenses !== null}
									type='checkbox'
									id='travelExpChk'
									name='travelExpChk'
									onChange={() =>
										setFormData((prev) => ({
											...prev,
											travelExpenses: travelExpenses !== null ? null : '',
											...(travelExpenses === null && {
												total: getTotal(),
											}),
										}))
									}
									className='form__input-switch'
								/>
							</div>
						)}
					{total !== '' && total !== 0 && (
						<h4 className='reservation-form-total'>
							<span className='reservation-form-total-title'>Total:</span> $
							{total}
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
								{location.pathname !== '/schedule' && (
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
								)}
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
	jobsXreservation: state.jobsXreservation,
});

export default connect(mapStateToProps, {
	updateReservation,
	loadReservationJobs,
	clearJobsXReservations,
})(withRouter(ReservationForm));
