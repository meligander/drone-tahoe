import React, { useState, useEffect } from 'react';

import Alert from '../layouts/Alert';

const RefundForm = ({ confirm, setToggleModal, reservation }) => {
	const [formData, setFormData] = useState({
		amount: '',
	});

	const { amount } = formData;

	useEffect(() => {
		setFormData({
			amount: '',
		});
	}, [confirm]);

	const onChange = (e) => {
		if (
			e.target.name !== 'amount' ||
			reservation.total >= Number(e.target.value)
		)
			setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
				Reservation Value: &nbsp; ${reservation && reservation.total}
			</h3>
			<Alert type='2' />
			<div className='form__group'>
				<input
					className='form__input'
					type='text'
					value={amount}
					onChange={onChange}
					id='amount'
					name='amount'
					placeholder='Refund'
				/>
				<label htmlFor='amount' className='form__label'>
					Refund
				</label>
			</div>

			<div className='popup-btns'>
				<button className='btn btn-success' type='submit'>
					Refund
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

export default RefundForm;
