import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import { signup, clearEmailSent } from '../../../actions/auth';
import { loadUser, updateUser } from '../../../actions/user';

import Alert from '../../layouts/Alert';

import './EditUser.scss';

const EditUser = ({
	auth: { loggedUser, isAuthenticated, loading, emailSent },
	user: { user, loadingUser },
	location,
	match,
	signup,
	loadUser,
	updateUser,
	clearEmailSent,
}) => {
	const isAdmin = loggedUser && loggedUser.type === 'admin';
	const pathId = match.params.user_id;

	let adminType = location.pathname.replace('/', '');

	if (pathId) adminType = adminType.replace(`/${pathId}`, '');

	const [formData, setFormData] = useState({
		id: '',
		name: '',
		lastname: '',
		email: '',
		password: '',
		passwordConf: '',
		cel: '',
		type: '',
	});

	const { name, lastname, email, password, cel, type, passwordConf } = formData;

	useEffect(() => {
		let userLoaded;

		if (
			(!userLoaded && adminType !== 'signup' && email === '') ||
			(adminType === 'profile' && email !== loggedUser.email)
		) {
			clearEmailSent();
			if (pathId) {
				if (loadingUser) loadUser(pathId);
				else userLoaded = user;
			} else userLoaded = loggedUser;

			if (userLoaded)
				setFormData((prev) => ({
					...prev,
					id: userLoaded.id,
					name: userLoaded.name,
					lastname: userLoaded.lastname,
					type: userLoaded.type,
					email: userLoaded.email,
					cel: userLoaded.cel === '0' ? '' : userLoaded.cel,
				}));
		}
	}, [
		loggedUser,
		loadingUser,
		user,
		pathId,
		loadUser,
		email,
		adminType,
		clearEmailSent,
	]);

	useEffect(() => {
		if (emailSent) window.scrollTo(0, 0);
	}, [emailSent]);

	const onChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const saveUser = async (e) => {
		e.preventDefault();

		if (adminType === 'signup') signup(formData);
		else updateUser(formData, adminType === 'profile');
	};

	const title = () => {
		switch (adminType) {
			case 'profile':
				return (
					<>
						<i className='fas fa-user-alt'></i>
						&nbsp;My Profile
					</>
				);
			case 'signup':
				return (
					<>
						<i className='fas fa-user-plus'></i>
						&nbsp;New account
					</>
				);
			case 'edit-user':
				return (
					<>
						<i className='fas fa-user-edit'></i>
						&nbsp;Edit User
					</>
				);
			default:
				break;
		}
	};

	return (
		(!isAuthenticated || !loading) && (
			<div className='user'>
				<h2 className='heading-primary'>
					{/* <FaUserPlus className="heading-icon" /> */}
					{title()}
				</h2>
				{!emailSent ? (
					<>
						<Alert type='1' />
						<form className='form' onSubmit={saveUser}>
							<div className='form__group'>
								<div className='form__group-sub'>
									<div className='form__group-sub-item'>
										<input
											type='text'
											className='form__input'
											placeholder='Name'
											id='name'
											onChange={onChange}
											value={name}
										/>
										<label htmlFor='name' className='form__label'>
											Name
										</label>
									</div>
									<div className='form__group-sub-item'>
										<input
											type='text'
											className='form__input'
											placeholder='Last Name'
											id='lastname'
											onChange={onChange}
											value={lastname}
										/>
										<label htmlFor='lastname' className='form__label'>
											Last Name
										</label>
									</div>
								</div>
							</div>
							<div className='form__group'>
								<input
									className='form__input'
									type='text'
									value={email}
									id='email'
									disabled={adminType !== 'signup'}
									onChange={onChange}
									placeholder='Email'
								/>
								<label htmlFor='email' className='form__label'>
									Email
								</label>
							</div>
							{isAdmin && (
								<div className='form__group'>
									<select
										className={`form__input ${type === '' ? 'empty' : ''}`}
										name='type'
										id='type'
										value={type}
										onChange={onChange}
									>
										<option value=''>* Select user type</option>
										<option value='admin'>Admin</option>
										<option value='customer'>Customer</option>
									</select>
									<label
										htmlFor='type'
										className={`form__label ${type === '' ? 'hide' : ''}`}
									>
										User Type
									</label>
								</div>
							)}
							{adminType === 'signup' && (
								<>
									<div className='form__group'>
										<input
											className='form__input'
											autoComplete='new-password'
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
								</>
							)}
							<div className='form__group'>
								<input
									className='form__input'
									type='text'
									value={cel}
									onChange={onChange}
									id='cel'
									placeholder='Cellphone'
								/>
								<label htmlFor='cel' className='form__label'>
									Cellphone
								</label>
							</div>

							<div className='btn-center'>
								<button className='btn btn-primary' type='submit'>
									{adminType === 'signup' ? (
										'Sign Up'
									) : (
										<i className='far fa-save'></i>
									)}
								</button>
								{adminType === 'signup' && (
									<p className='user-login'>
										Do you already have an account? &nbsp;
										<Link
											onClick={() => window.scrollTo(0, 0)}
											className='btn-link'
											to='/login'
										>
											Login
										</Link>
									</p>
								)}
							</div>
						</form>
					</>
				) : (
					<div className='user-email u-center-text'>
						<div>
							<i className='fas fa-envelope user-email-icon'></i>
							<h4 className='user-email-text'>
								We've sent an email to{' '}
								<span className='user-email-text-email'>{email}</span>.
								<br />
								Click the confirmation link in that email to start using our
								servicies.
							</h4>
							<div className='user-email-subtext'>
								<p>If you did not recieve the email,&nbsp;</p>
								<button type='button' onClick={saveUser} className='btn-link'>
									resend it.
								</button>
								<br />
								<p>Check the spam folder to be sure it was not sent.</p>
							</div>
						</div>
					</div>
				)}
			</div>
		)
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	user: state.user,
});

export default connect(mapStateToProps, {
	signup,
	updateUser,
	loadUser,
	clearEmailSent,
})(withRouter(EditUser));
