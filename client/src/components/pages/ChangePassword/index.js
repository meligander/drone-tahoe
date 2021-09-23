import React, { useState } from 'react';
import { connect } from 'react-redux';

import { resetPassword } from '../../../actions/auth';

import Alert from '../../layouts/Alert';

import './ChangePassword.scss';

const ChangePassword = ({ resetPassword, match }) => {
	const [formData, setFormData] = useState({
		password: '',
		passwordConf: '',
	});

	const { password, passwordConf } = formData;

	const onSubmit = (e) => {
		e.preventDefault();
		resetPassword({ ...formData, resetLink: match.params.token });
	};

	const onChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	return (
		<>
			<div className='changepassword'>
				<h2 className='heading-primary'>Reset Password</h2>
				<form onSubmit={onSubmit} className='form'>
					<Alert type='1' />
					<div className='form__group'>
						<input
							className='form__input'
							id='password'
							type='password'
							value={password}
							placeholder='Password'
							onChange={onChange}
						/>
						<label htmlFor='password' className='form__label'>
							Password
						</label>
					</div>
					<div className='form__group'>
						<input
							className='form__input'
							id='passwordConf'
							type='password'
							value={passwordConf}
							placeholder='Confirm Password'
							onChange={onChange}
						/>
						<label htmlFor='passwordConf' className='form__label'>
							Confirm Password
						</label>
					</div>
					<div className='u-center-text'>
						<button className='btn btn-primary'>
							<i className='far fa-save'></i>
						</button>
					</div>
				</form>
			</div>
		</>
	);
};

export default connect(null, { resetPassword })(ChangePassword);
