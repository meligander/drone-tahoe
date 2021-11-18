import React, { useState, useRef, useEffect, Fragment } from 'react';
import { connect } from 'react-redux';

import { resetPassword } from '../../../actions/auth';

import Alert from '../../layouts/Alert';

import './ChangePassword.scss';

const ChangePassword = ({
	resetPassword,
	match,
	global: { footer, navbar },
}) => {
	const container = useRef();

	const [formData, setFormData] = useState({
		password: '',
		passwordConf: '',
	});

	const { password, passwordConf } = formData;

	const [adminValues, setAdminValues] = useState({
		float: true,
	});

	const { float } = adminValues;

	useEffect(() => {
		if (container.current) {
			const item = container.current.getBoundingClientRect();

			if (item.height + footer + navbar + 60 >= window.innerHeight)
				setAdminValues((prev) => ({
					...prev,
					float: false,
				}));
		}
	}, [footer, navbar]);

	const onSubmit = (e) => {
		e.preventDefault();
		resetPassword({ ...formData, resetLink: match.params.token });
	};

	const onChange = (e) => {
		e.persist();
		setFormData((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	return (
		<Fragment>
			<div className={`changepassword ${float ? 'float' : ''}`} ref={container}>
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
						<button className='btn btn-primary'>Save</button>
					</div>
				</form>
			</div>
		</Fragment>
	);
};

const mapStateToProps = (state) => ({
	global: state.global,
});

export default connect(mapStateToProps, { resetPassword })(ChangePassword);
