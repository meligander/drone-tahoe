import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { loadJobs } from '../../../actions/jobs';
import { loadJobUsers } from '../../../actions/jobsXReservations';
import { clearUser } from '../../../actions/user';
import { sendEmail } from '../../../actions/auth';

import Alert from '../../layouts/Alert';
import PopUp from '../../layouts/PopUp';
import DatesFiled from '../../DatesFiled';

import './Outreach.scss';

const Outreach = ({
	loadJobs,
	loadJobUsers,
	clearUser,
	sendEmail,
	job: { loading: loadingJobs, jobs: jobsList },
	jobsXreservation: { loading, error, jobsXreservations },
}) => {
	const initialValues = {
		hourFrom: '',
		hourTo: '',
		total: '',
		jobs: [],
	};

	const [adminValues, setAdminValues] = useState({
		showFilter: true,
		users: [],
		toggleEmail: false,
	});

	const [formData, setFormData] = useState(initialValues);

	const { showFilter, users, toggleEmail } = adminValues;

	const { hourFrom, hourTo, total, jobs } = formData;

	useEffect(() => {
		if (loadingJobs) loadJobs({});
	}, [loadingJobs, loadJobs]);

	useEffect(() => {
		if (jobsXreservations.length > 0)
			setAdminValues((prev) => ({
				...prev,
				users: jobsXreservations.map((item) => item.reservation.user.email),
			}));
	}, [jobsXreservations]);

	const onSubmit = (e) => {
		e.preventDefault();
		loadJobUsers(formData);
	};

	const onChange = (e, job) => {
		if (
			e.target.id !== 'total' ||
			(e.target.id === 'total' &&
				(Number(e.target.value) || e.target.value === ''))
		)
			setFormData((prev) => ({
				...prev,
				...(job
					? {
							jobs: e.target.checked
								? [...jobs, Number(e.target.value)]
								: jobs.filter((item) => item !== job.id),
					  }
					: { [e.target.id]: e.target.value }),
			}));
	};

	return (
		<div className='outreach list'>
			<PopUp
				type='email'
				confirm={async (emailData) => {
					const answer = await sendEmail(emailData, true);
					if (answer) {
						setAdminValues((prev) => ({
							...prev,
							toggleEmail: false,
							users: [],
						}));
						setFormData(initialValues);
					}
				}}
				toUpdate={users}
				toggleModal={toggleEmail}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleEmail: !toggleEmail,
					}))
				}
			/>
			<h2 className='heading-primary'>Outreach</h2>
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
					<DatesFiled hourFrom={hourFrom} onChange={onChange} hourTo={hourTo} />
					<div className='form__group'>
						<input
							className='form__input'
							type='text'
							value={total}
							id='total'
							onChange={onChange}
							placeholder='Minimal Total'
						/>
						<label htmlFor='total' className='form__label'>
							Minimal Total
						</label>
					</div>
					<div className='outreach-jobs-list'>
						{!loadingJobs &&
							jobsList.map((job) => (
								<div className='outreach-jobs-item' key={job.id}>
									<input
										type='checkbox'
										value={job.id}
										className='form__input-chk'
										id={`chk-${job.id}`}
										name='jobs'
										onChange={(e) => onChange(e, job)}
									/>
									<label className='form__label-chk' htmlFor={`chk-${job.id}`}>
										<span>
											<svg width='12px' height='9px' viewBox='0 0 12 9'>
												<polyline points='1 5 4 8 11 1'></polyline>
											</svg>
										</span>
										<span>{job.title}</span>
									</label>
								</div>
							))}
					</div>
					<button type='submit' className='btn btn-tertiary'>
						<i className='fas fa-search'></i>&nbsp; Search
					</button>
				</div>
			</form>
			{!loading && (
				<Fragment>
					{jobsXreservations.length > 0 ? (
						<div>
							<div className='wrapper'>
								<table>
									<thead>
										<tr>
											<th>Name</th>
											<th>Email</th>
											<th>Job</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{jobsXreservations.map((item) => (
											<tr key={item.id}>
												<td>
													<Link
														className='btn-link'
														to={`/edit-user/${item.reservation.userId}`}
														onClick={() => {
															window.scrollTo(0, 0);
															clearUser();
														}}
													>
														{item.reservation.user.name}{' '}
														{item.reservation.user.lastname}
													</Link>
												</td>
												<td>{item.reservation.user.email}</td>
												<td>
													{item.jobs
														? item.jobs.map((job) => (
																<p
																	key={`jb-${job.id}`}
																	className='outreach-list-jobs'
																>
																	{job.title}
																</p>
														  ))
														: item.job.title}
												</td>
												<td>
													<input
														type='checkbox'
														value={item.reservation.user.email}
														className='form__input-chk'
														id={`user-${item.id}`}
														checked={users.some(
															(email) => email === item.reservation.user.email
														)}
														onChange={(e) => {
															if (e.target.checked)
																setAdminValues((prev) => ({
																	...prev,
																	users: [...users, e.target.value],
																}));
															else
																setAdminValues((prev) => ({
																	...prev,
																	users: users.filter(
																		(item) => item !== e.target.value
																	),
																}));
														}}
													/>
													<label
														className='form__label-chk'
														htmlFor={`user-${item.id}`}
													>
														<span>
															<svg width='12px' height='9px' viewBox='0 0 12 9'>
																<polyline points='1 5 4 8 11 1'></polyline>
															</svg>
														</span>
													</label>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className='list-total'>
								<span className='list-total-title text-dark'>Total:</span>
								&nbsp;
								{jobsXreservations.length}
							</div>
						</div>
					) : (
						<h3 className='heading-primary-subheading u-center-text text-danger'>
							{error.msg}
						</h3>
					)}
					{users.length > 0 && (
						<div className='btn-right'>
							<button
								onClick={() =>
									setAdminValues((prev) => ({
										...prev,
										toggleEmail: !toggleEmail,
									}))
								}
								className='btn btn-primary'
							>
								<i className='fas fa-paper-plane'></i> &nbsp; Email
							</button>
						</div>
					)}
				</Fragment>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	job: state.job,
	jobsXreservation: state.jobsXreservation,
});

export default connect(mapStateToProps, {
	loadJobs,
	clearUser,
	loadJobUsers,
	sendEmail,
})(Outreach);
