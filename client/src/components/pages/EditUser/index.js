import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import { signup } from '../../../actions/auth';
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
}) => {
	const isAdmin = loggedUser && loggedUser.type === 'admin';
	const id = match.params.user_id;

	let adminType = location.pathname.replace('/', '');

	if (id) adminType = adminType.replace(`/${id}`, '');

	const [formData, setFormData] = useState({
		name: '',
		lastname: '',
		email: '',
		password: '',
		passwordConf: '',
		cel: '',
		type: '',
		homeTown: '',
	});

	const { name, lastname, email, password, cel, type, homeTown, passwordConf } =
		formData;

	useEffect(() => {
		let userLoaded;

		if (id) {
			if (loadingUser) loadUser(id);
			else userLoaded = user;
		} else if (!loading) userLoaded = loggedUser;

		if (userLoaded) {
			setFormData((prev) => ({
				...prev,
				name: userLoaded.name,
				lastname: userLoaded.lastname,
				type: userLoaded.type,
				email: userLoaded.email,
				...(userLoaded.homeTown && { homeTown: userLoaded.homeTown }),
				cel: userLoaded.cel === '0' ? '' : userLoaded.cel,
			}));
		}
	}, [loading, loggedUser, loadingUser, user, id, loadUser]);

	const onChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const saveUser = async (e) => {
		e.preventDefault();

		if (adminType === 'signup') signup(formData);
		else
			updateUser(
				formData,
				adminType === 'profile' ? loggedUser.id : id,
				adminType === 'profile'
			);
	};

	return (
		(!isAuthenticated || !loading) && (
			<div className='user'>
				<h2 className='heading-primary'>
					{/* <FaUserPlus className="heading-icon" /> */}
					{adminType === 'profile' ? (
						<>
							<i className='fas fa-user-alt'></i>
							&nbsp;My Profile
						</>
					) : (
						<>
							<i className='fas fa-user-plus'></i>
							&nbsp;New account
						</>
					)}
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
											placeholder='First Name'
											id='name'
											onChange={onChange}
											value={name}
										/>
										<label htmlFor='name' className='form__label'>
											First Name
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
									disabled={adminType === 'profile' && !isAdmin}
									onChange={onChange}
									placeholder='Email'
								/>
								<label htmlFor='email' className='form__label'>
									Email
								</label>
							</div>
							{isAdmin && (
								<div className='form__group'>
									<label htmlFor='type' className='form__label'>
										User Type
									</label>
									<select
										className='form__input'
										name='type'
										id='type'
										value={type}
										onChange={onChange}
									>
										<option value=''>* Select user type</option>
										<option value='admin'>Admin</option>
										<option value='customer'>Customer</option>
									</select>
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
							<div className='form__group'>
								<input
									className='form__input'
									type='text'
									value={homeTown}
									onChange={onChange}
									id='homeTown'
									placeholder='Address'
								/>
								<label htmlFor='homeTown' className='form__label'>
									Address
								</label>
							</div>

							<div className='u-center-text'>
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
})(withRouter(EditUser));
