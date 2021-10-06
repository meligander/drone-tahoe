import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { registerUpdateJob } from '../../actions/jobs';

import Alert from '../layouts/Alert';

const JobForm = ({ registerUpdateJob, job, setToggleModal }) => {
	const [formData, setFormData] = useState({
		title: '',
		subtitle: '',
		poptext: '',
		time: '',
		price: '',
	});

	const { title, subtitle, poptext, time, price } = formData;

	useEffect(() => {
		if (job) {
			setFormData({
				title: job.title,
				subtitle: job.subtitle ? job.subtitle : '',
				poptext: job.poptext ? job.poptext : '',
				time: job.time,
				price: job.price,
			});
		} else
			setFormData({
				title: '',
				subtitle: '',
				poptext: '',
				time: '',
				price: '',
			});
	}, [job, setToggleModal]);

	const onChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
	};

	const onSubmit = (e) => {
		e.preventDefault();
		registerUpdateJob(formData, job ? job.id : null);
		setToggleModal();
	};

	return (
		<form className='form' onSubmit={onSubmit}>
			<Alert type='2' />
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
			<div className='form__group'>
				<input
					className='form__input'
					type='text'
					value={subtitle}
					id='subtitle'
					onChange={onChange}
					placeholder='Subtitle'
				/>
				<label htmlFor='subtitle' className='form__label'>
					Subtitle
				</label>
			</div>
			<div className='form__group'>
				<div className='form__group-sub'>
					<div className='form__group-sub-item'>
						<input
							type='number'
							className='form__input'
							placeholder='Time it takes'
							id='time'
							onChange={onChange}
							value={time}
						/>
						<label htmlFor='time' className='form__label'>
							Time it takes
						</label>
					</div>
					<div className='form__group-sub-item'>
						<input
							type='number'
							step='any'
							min='0'
							className='form__input'
							placeholder='Price'
							id='price'
							onChange={onChange}
							value={price}
						/>
						<label htmlFor='price' className='form__label'>
							Price
						</label>
					</div>
				</div>
			</div>
			<div className='form__group'>
				<textarea
					type='text'
					className='form__input textarea'
					value={poptext}
					rows='3'
					onChange={onChange}
					placeholder='Extra Info'
					id='poptext'
				/>
				<label htmlFor='poptext' className='form__label'>
					Extra Info
				</label>
			</div>

			<div className='popup-btns'>
				<button type='submit' className='btn btn-success'>
					{job ? 'Update' : 'Save'}
				</button>
				<button
					type='button'
					className='btn btn-danger'
					onClick={setToggleModal}
				>
					Cancel
				</button>
			</div>
		</form>
	);
};

export default connect(null, { registerUpdateJob })(JobForm);
