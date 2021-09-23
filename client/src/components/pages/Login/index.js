import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';

import {
	facebookLogin,
	googleLogin,
	loginUser,
	sendPasswordLink,
} from '../../../actions/auth';
import { setAlert } from '../../../actions/alert';

import Alert from '../../layouts/Alert';
import Loading from '../../layouts/Loading';

import './Login.scss';

const Login = ({
	auth: { error },
	facebookLogin,
	googleLogin,
	loginUser,
	setAlert,
	sendPasswordLink,
}) => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const { email, password } = formData;

	const [adminValues, setAdminValues] = useState({
		forgotPassword: false,
	});

	const { forgotPassword } = adminValues;

	const onChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const onSubmit = (e) => {
		e.preventDefault();

		if (forgotPassword) sendPasswordLink(email);
		else {
			loginUser(formData);
		}
	};

	const responseSuccessGoogle = (response) => {
		googleLogin({ tokenId: response.tokenId });
	};

	const responseErrorGoogle = (err) => {
		console.log(err.error);
		setAlert('Error login in', 'danger', '2');
	};

	const responseFacebook = (response) => {
		facebookLogin({
			accessToken: response.accessToken,
			userID: response.userID,
		});
	};

	return (
		<div className='section-login'>
			<Loading />
			<div className='login'>
				<div className='login-card'>
					<form onSubmit={onSubmit} className='form'>
						<h2 className='heading-primary'>
							{forgotPassword ? 'Change Password' : 'Login'}
						</h2>
						<Alert type='1' />
						{forgotPassword ? (
							<>
								<div className='form-section'>
									<div className='form-group'>
										<input
											className='form__input'
											type='email'
											name='email'
											value={email}
											onChange={(e) => onChange(e)}
											placeholder='Email'
										/>
										<label htmlFor='email' className='form__label'>
											Email
										</label>
									</div>
								</div>
								<div className='u-center-text'>
									<button type='submit' className='btn btn-primary'>
										Send Link
									</button>
									<p className='login-card-sign'>
										An email will be sent to the address so you can change the
										password.
									</p>
									<p className='login-card-sign'>
										Please, check your spam folder before resendig the email.
									</p>
								</div>
								<br />
								<button
									className='btn-link'
									onClick={() =>
										setAdminValues((prev) => ({
											...prev,
											forgotPassword: false,
										}))
									}
								>
									Go Back
								</button>
							</>
						) : (
							<>
								<div className='form-section'>
									<div className='form__group'>
										<input
											className='form__input'
											type='email'
											name='email'
											value={email}
											onChange={(e) => onChange(e)}
											placeholder='Email'
										/>
										<label htmlFor='email' className='form__label'>
											Email
										</label>
									</div>
									<div className='form__group'>
										<input
											className='form__input'
											type='password'
											value={password}
											name='password'
											onChange={(e) => onChange(e)}
											placeholder='Password'
										/>
										<label htmlFor='name' className='form__label'>
											Password
										</label>
									</div>
								</div>
								<div className='u-center-text'>
									<button type='submit' className='btn btn-primary'>
										Sign In
									</button>
									<p className='login-card-sign'>
										Don't have an account? &nbsp;
										<Link
											className='btn-link'
											onClick={() => window.scrollTo(0, 0)}
											to='/signup'
										>
											Sign up
										</Link>
									</p>
									<p className='login-card-sign'>
										Forgot password? &nbsp;
										<button
											className='btn-link'
											onClick={() =>
												setAdminValues((prev) => ({
													...prev,
													forgotPassword: true,
												}))
											}
										>
											Change Password
										</button>
									</p>
									<div className='login-card-smedia'>
										<GoogleLogin
											clientId={process.env.REACT_APP_GOOGLE_KEY}
											buttonText='Login'
											className='btn-google'
											onSuccess={responseSuccessGoogle}
											onFailure={responseErrorGoogle}
											cookiePolicy={'single_host_origin'}
										/>
										<span className='btn-facebook'>
											<FacebookLogin
												appId={process.env.REACT_APP_FACEBOOK_KEY}
												autoLoad={false}
												textButton={<i className='fab fa-facebook-f'></i>}
												callback={responseFacebook}
											/>
										</span>
									</div>
								</div>
							</>
						)}
					</form>
					<div className='login-img img'>
						<h3 className='login-img-text'>
							Welcome <br /> Back!
						</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, {
	facebookLogin,
	googleLogin,
	loginUser,
	setAlert,
	sendPasswordLink,
})(Login);