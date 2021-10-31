import React, { useState, useEffect } from 'react';

import Alert from '../layouts/Alert';

const EmailForm = ({ setToggleModal, toggleModal, confirm }) => {
	const [formData, setFormData] = useState({
		subject: '',
		message: '',
	});

	const { subject, message } = formData;

	useEffect(() => {
		if (!toggleModal) setFormData({ subject: '', message: '' });
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
			<h3 className='heading-primary-subheading'>Promotion Email:</h3>
			<Alert type='2' />
			<div className='form__group'>
				<input
					className='form__input'
					type='text'
					value={subject}
					id='subject'
					onChange={onChange}
					placeholder='Subject'
				/>
				<label htmlFor='subject' className='form__label'>
					Subject
				</label>
			</div>
			<div className='form__group'>
				<textarea
					type='text'
					className='form__input textarea'
					value={message}
					rows='5'
					onChange={onChange}
					placeholder='Email Message'
					id='message'
				/>
				<label htmlFor='message' className='form__label'>
					Email Message
				</label>
			</div>

			<div className='popup-btns'>
				<button type='submit' className='btn btn-success'>
					Send
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

export default EmailForm;
