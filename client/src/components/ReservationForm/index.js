import React, { useState, useEffect, useRef, Fragment } from 'react';
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
	const regex = /^[0-9]+(\.([0-9]{1,2})?)?$/;

	const disabled =
		reservation &&
		reservation.status !== 'requested' &&
		reservation.status !== 'unpaid';

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
		comments: null,
		travelExpenses: null,
		refundReason: null,
		total: '',
		hourFrom: '',
		hourTo: '',
	});

	const [adminValues, setAdminValues] = useState({
		searchDisplay: false,
		clear: false,
		changeDate: false,
		percentage: [null],
	});

	const { searchDisplay, clear, changeDate, percentage } = adminValues;
	const {
		id,
		jobs,
		user,
		address,
		comments,
		total,
		travelExpenses,
		refundReason,
	} = formData;

	useEffect(() => {
		if (reservation) {
			if (!reservation.jobs && loading) loadReservationJobs(reservation.id);
			else {
				if (id !== reservation.id) {
					setFormData((prev) => {
						let oldReservation = {};
						for (const x in prev) {
							oldReservation[x] = !reservation[x] ? prev[x] : reservation[x];
						}
						return {
							...oldReservation,
							jobs: jobsXreservations.map((item) => {
								return { ...item, value: item.value === 0 ? '' : item.value };
							}),
						};
					});
					setAdminValues((prev) => ({
						...prev,
						percentage: jobsXreservations.map((item) => {
							if (item.discount !== null) {
								const value = (item.discount * 100) / item.value;
								return Math.round((value + Number.EPSILON) * 100) / 100;
							} else return null;
						}),
					}));
				}
			}
		}
	}, [reservation, id, loading, loadReservationJobs, jobsXreservations]);

	const getTotal = (expence) => {
		const total = jobs.reduce((sum, item) => {
			let itemValue = Number(item.value);
			if (item.discount !== null) itemValue = itemValue - Number(item.discount);
			return sum + itemValue;
		}, 0);
		let value = expence !== null ? total + Number(expence) : total;

		value = Math.round((value + Number.EPSILON) * 100) / 100;

		return value;
	};

	const onChange = (e) => {
		e.persist();
		if (e.target.id === 'travelExpenses') {
			if (regex.test(e.target.value) || e.target.value === '') {
				setFormData((prev) => ({
					...prev,
					travelExpenses: e.target.value,
					total: getTotal(e.target.value),
				}));
			}
		} else {
			setFormData((prev) => ({
				...prev,
				[e.target.id]: e.target.value,
			}));
		}
	};

	const onChangeJobs = (e) => {
		e.persist();
		if (
			e.target.name === 'jobId' ||
			e.target.value === '' ||
			(regex.test(e.target.value) &&
				(jobs[e.target.id].discount === null ||
					Number(jobs[e.target.id].discount) <= Number(e.target.value)))
		)
			jobs[e.target.id][e.target.name] = e.target.value;
		else {
			if (regex.test(e.target.value)) jobs[e.target.id].value = e.target.value;
			jobs[e.target.id].discount = '';
			percentage[e.target.id] = '';
			setAdminValues((prev) => ({ ...prev, percentage }));
		}

		setFormData((prev) => ({
			...prev,
			jobs,
			...(e.target.name !== 'jobId' && { total: getTotal(travelExpenses) }),
		}));
	};

	const onChangeJobsDiscount = (e) => {
		e.persist();
		if (regex.test(e.target.value)) {
			if (
				e.target.name === 'discount' &&
				Number(jobs[e.target.id].value) >= Number(e.target.value)
			) {
				const value =
					(Number(e.target.value) * 100) / Number(jobs[e.target.id].value);

				percentage[e.target.id] =
					Math.round((value + Number.EPSILON) * 100) / 100;
				jobs[e.target.id].discount = e.target.value;
			} else {
				if (Number(e.target.value) <= 100) {
					const value =
						(Number(e.target.value) * Number(jobs[e.target.id].value)) / 100;

					percentage[e.target.id] = e.target.value;
					jobs[e.target.id].discount =
						Math.round((value + Number.EPSILON) * 100) / 100;
				}
			}
		} else if (e.target.value === '') {
			jobs[e.target.id].discount = '';
			percentage[e.target.id] = '';
		}

		setFormData((prev) => ({
			...prev,
			jobs,
			total: getTotal(travelExpenses),
		}));
		setAdminValues((prev) => ({ ...prev, percentage }));
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
								clearJobsXReservations();
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

					{loggedUser.type !== 'admin' && !reservation && (
						<p className='text-warning'>
							Enter job site address and job type. Add additional jobs, if any,
							by clicking the ‘+ Job’ button. Once all jobs are entered, select
							your desired date/time below.
						</p>
					)}

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
						<Fragment>
							<p className='reservation-form-item'>
								<span className='reservation-form-title'>Status:</span>{' '}
								{reservation.status.charAt(0).toUpperCase() +
									reservation.status.slice(1)}
							</p>
							{reservation.status !== 'unpaid' &&
								reservation.status !== 'requested' && (
									<Fragment>
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
									</Fragment>
								)}
						</Fragment>
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
							placeholder='Address'
						/>
						<label htmlFor='address' className='form__label'>
							Address
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
										{loggedUser.type === 'admin' ? (
											<Fragment>
												<div className='form__group'>
													<input
														className='form__input'
														type='text'
														value={item.value}
														onChange={onChangeJobs}
														disabled={disabled}
														id={i}
														name='value'
														placeholder='Job Value'
													/>
													<label htmlFor={i} className='form__label'>
														Job Value
													</label>
												</div>
												<div
													className={`form__group ${
														item.discount === null ? 'hide' : ''
													}`}
												>
													<div className='form__group-sub'>
														<div className='form__group-sub-item'>
															<input
																type='text'
																className='form__input'
																placeholder='Discount'
																name='discount'
																disabled={disabled}
																id={i}
																onChange={onChangeJobsDiscount}
																value={
																	item.discount !== null ? item.discount : ''
																}
															/>
															<label htmlFor='discount' className='form__label'>
																Discount
															</label>
														</div>
														<div className='form__group-sub-item'>
															<input
																type='text'
																className='form__input'
																placeholder='Percentage'
																name='percentage'
																disabled={disabled}
																id={i}
																onChange={onChangeJobsDiscount}
																value={
																	item.discount !== null ? percentage[i] : ''
																}
															/>
															<label
																htmlFor='percentage'
																className='form__label'
															>
																Percentage
															</label>
														</div>
													</div>
												</div>

												{((reservation &&
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
															type='checkbox'
															id='discountChk'
															checked={item.discount !== null}
															onChange={(e) => {
																e.persist();
																if (!e.target.checked) {
																	jobs[i].discount = null;
																	percentage[i] = null;
																} else {
																	jobs[i].discount = '';
																	percentage[i] = '';
																}

																setFormData((prev) => ({
																	...prev,
																	jobs,
																	...(jobs[i].discount == null && {
																		total: getTotal(travelExpenses),
																	}),
																}));

																setAdminValues((prev) => ({
																	...prev,
																	percentage,
																}));
															}}
															className='form__input-switch'
														/>
													</div>
												)}
											</Fragment>
										) : (
											item.value && (
												<div className='jobs-list-item-price'>
													<table>
														<tbody>
															<tr>
																<td className='text-dark'>Value:</td>
																<td>&nbsp;${item.value}&nbsp;</td>
															</tr>
															{item.discount !== null && (
																<tr>
																	<td className='text-dark'>Discount:</td>
																	<td>
																		${item.discount} ({percentage[i]}% off)
																	</td>
																</tr>
															)}
														</tbody>
													</table>
												</div>
											)
										)}
									</div>
									{!disabled && (
										<button
											className='btn-icon'
											onClick={(e) => {
												e.preventDefault();
												jobs.splice(i, 1);
												percentage.splice(i, 1);
												setFormData((prev) => ({
													...prev,
													jobs,
													total: getTotal(travelExpenses),
												}));
												setAdminValues((prev) => ({ ...prev, percentage }));
											}}
										>
											<i className='far fa-trash-alt'></i>
										</button>
									)}
								</div>
							))}
						{!disabled && (
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
										percentage.push(null);
										setAdminValues((prev) => ({ ...prev, percentage }));
									}}
								>
									<i className='fas fa-plus'></i> &nbsp; Job
								</button>
							</div>
						)}
					</div>

					<div className={`form__group ${comments === null ? 'hide' : 'show'}`}>
						<textarea
							type='text'
							className='form__input textarea'
							value={comments === null ? '' : comments}
							id='comments'
							disabled={disabled}
							rows='3'
							onChange={onChange}
							placeholder='Special Request'
						/>
						<label htmlFor='comments' className='form__label'>
							Special Request
						</label>
					</div>
					{(!reservation ||
						(reservation &&
							(reservation.status === 'requested' ||
								reservation.status === 'unpaid'))) && (
						<div className='form__group switch'>
							<label className='form__label-switch' htmlFor='commentsChk'>
								Special Request
							</label>
							<input
								checked={comments !== null}
								type='checkbox'
								id='commentsChk'
								name='commentsChk'
								onChange={(e) => {
									e.persist();
									setFormData((prev) => ({
										...prev,
										comments: e.target.checked ? '' : null,
									}));
								}}
								className='form__input-switch'
							/>
						</div>
					)}

					{(loggedUser.type === 'admin' ||
						(loggedUser.type === 'customer' && travelExpenses !== null)) && (
						<div
							className={`form__group ${
								travelExpenses === null ? 'hide' : 'show'
							}`}
						>
							<input
								className='form__input'
								type='text'
								value={travelExpenses !== null ? travelExpenses : ''}
								onChange={onChange}
								disabled={disabled || loggedUser.type === 'customer'}
								id='travelExpenses'
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
									onChange={(e) => {
										e.persist();
										setFormData((prev) => ({
											...prev,
											travelExpenses: e.target.checked ? '' : null,
											...(!e.target.checked && { total: getTotal(null) }),
										}));
									}}
									className='form__input-switch'
								/>
							</div>
						)}
					{refundReason !== null && (
						<div className='form__group'>
							<textarea
								type='text'
								className='form__input textarea'
								value={refundReason}
								id='refundReason'
								rows='3'
								disabled={loggedUser.type === 'customer'}
								onChange={onChange}
								placeholder='Refund Reason'
							/>
							<label htmlFor='refundReason' className='form__label'>
								Refund Reason
							</label>
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
						reservation.status !== 'completed' && (
							<div className='btn-center'>
								{!changeDate &&
									(reservation.status !== 'paid' ||
										(refundReason !== null && loggedUser.type === 'admin')) && (
										<button className='btn' type='submit'>
											Save
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
