import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { loadJobs, deleteJob, registerUpdateJob } from '../../../actions/jobs';

import PopUp from '../../layouts/PopUp';
import Alert from '../../layouts/Alert';

const JobsList = ({
	loadJobs,
	deleteJob,
	registerUpdateJob,
	job: { jobs, loading, error },
}) => {
	const [formData, setFormData] = useState({
		title: '',
	});

	const [adminValues, setAdminValues] = useState({
		toggleDeleteConf: false,
		toggleJob: false,
		showFilter: false,
		job: null,
		update: false,
	});

	const { title } = formData;

	const { toggleDeleteConf, toggleJob, showFilter, update, job } = adminValues;

	useEffect(() => {
		if (loading) loadJobs({});
	}, [loading, loadJobs]);

	const onChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const onSubmit = (e) => {
		e.preventDefault();
		setFormData({
			title: '',
		});
		loadJobs(formData);
	};

	return (
		<div className='list'>
			<PopUp
				type='confirmation'
				confirm={() => deleteJob(job.id)}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleDeleteConf: !toggleDeleteConf,
					}))
				}
				toggleModal={toggleDeleteConf}
				text='Are you sure you want to delete the job?'
			/>
			<PopUp
				type='job'
				toUpdate={update ? job : null}
				confirm={async (jobData) => {
					const answer = await registerUpdateJob(jobData, job ? job.id : 0);
					if (answer)
						setAdminValues((prev) => ({
							...prev,
							toggleJob: false,
							job: null,
						}));
				}}
				toggleModal={toggleJob}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleJob: !toggleJob,
						job: null,
					}))
				}
			/>
			<h2 className='heading-primary'>Jobs</h2>

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
						<input
							className='form__input'
							type='text'
							value={title}
							id='title'
							onChange={onChange}
							placeholder='Title'
						/>
						<label htmlFor='title' className='form__label'>
							Title
						</label>
					</div>

					<button type='submit' className='btn btn-tertiary'>
						<i className='fas fa-search'></i>&nbsp; Search
					</button>
				</div>
			</form>
			{!loading && (
				<>
					{jobs.length > 0 ? (
						<div>
							<div className='wrapper'>
								<table className='icon-2'>
									<thead>
										<tr>
											<th>Title</th>
											{/* <th>Subtitle</th> */}
											<th></th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{jobs.map((job) => (
											<tr key={job.id}>
												<td>{job.title}</td>
												{/* <td>{job.subtitle}</td> */}
												<td>
													<button
														className='btn-icon'
														onClick={() =>
															setAdminValues((prev) => ({
																...prev,
																toggleJob: !toggleJob,
																job,
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
																job,
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
									toggleJob: !toggleJob,
								}))
							}
							className='btn btn-primary'
						>
							<i className='fas fa-plus'></i> &nbsp; Job
						</button>
					</div>
				</>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	job: state.job,
});

export default connect(mapStateToProps, {
	loadJobs,
	deleteJob,
	registerUpdateJob,
})(JobsList);
