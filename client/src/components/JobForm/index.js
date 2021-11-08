import React, { useState, useEffect } from 'react';

import Alert from '../layouts/Alert';

const JobForm = ({ job, setToggleModal, toggleModal, confirm }) => {
	const [formData, setFormData] = useState({
		id: 0,
		title: '',
		subtitle: '',
		poptext: '',
	});

	const { title, subtitle, poptext } = formData;

	useEffect(() => {
		if (job) {
			setFormData((prev) => {
				if (prev.id !== job.id)
					return {
						id: job.id,
						title: job.title,
						subtitle: job.subtitle ? job.subtitle : '',
						poptext: job.poptext ? job.poptext : '',
					};
				else return prev;
			});
		}
	}, [job]);

	useEffect(() => {
		if (!toggleModal)
			setFormData({ id: 0, title: '', subtitle: '', poptext: '' });
	}, [toggleModal]);

	const onChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
	};

	return (
		<form
			className='form'
			onSubmit={(e) => {
				e.preventDefault();
				confirm(formData);
			}}
		>
			<h3 className='heading-primary-subheading'>
				{job ? 'Update' : 'New'} Job:
			</h3>
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
					Save
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

export default JobForm;
