import React, { useState, useEffect } from 'react';

import Alert from '../layouts/Alert';

const RefundForm = ({ confirm, setToggleModal, reservation }) => {
	const regex = /^[0-9]+(\.([0-9]{1,2})?)?$/;

	const [formData, setFormData] = useState({
		amount: '',
		refundReason: '',
	});

	const { amount, refundReason } = formData;

	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			amount: '',
			refundReason: '',
		}));
	}, [confirm]);

	useEffect(() => {
		if (reservation && reservation.refundReason !== null)
			setFormData((prev) => ({
				...prev,
				refundReason: reservation.refundReason,
			}));
	}, [reservation]);

	const onChange = (e) => {
		if (
			e.target.id !== 'amount' ||
			e.target.value === '' ||
			(regex.test(e.target.value) &&
				reservation.total >= Number(e.target.value))
		)
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
			{console.log(reservation && reservation.refundReason !== null)}
			<h3 className='heading-primary-subheading'>
				Reservation Total: &nbsp; ${reservation && reservation.total}
			</h3>
			<Alert type='2' />
			<div className='form__group'>
				<input
					className='form__input'
					type='text'
					value={amount}
					onChange={onChange}
					id='amount'
					placeholder='Refund'
				/>
				<label htmlFor='amount' className='form__label'>
					Refund
				</label>
			</div>
			<div className='form__group'>
				<textarea
					type='text'
					className='form__input textarea'
					value={refundReason}
					id='refundReason'
					rows='3'
					onChange={onChange}
					placeholder='Refund Reason'
				/>
				<label htmlFor='refundReason' className='form__label'>
					Refund Reason
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
