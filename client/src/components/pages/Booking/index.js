import React, { useState } from 'react';
import { connect } from 'react-redux';

import { sendEmail } from '../../../actions/auth';

import Alert from '../../layouts/Alert';
import Loading from '../../layouts/Loading';

import './Booking.scss';

const Booking = ({ sendEmail, auth: { loggedUser } }) => {
	const initialValues = {
		name: '',
		lastname: '',
		phone: '',
		email: '',
		company: '',
		experience: '',
		message: '',
	};

	const [formData, setFormData] = useState(initialValues);

	const { name, lastname, phone, email, company, experience, message } =
		formData;

	const onChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		const answer = await sendEmail(
			{
				...formData,
				...(loggedUser && {
					name: loggedUser.name,
					lastname: loggedUser.lastname,
					phone: loggedUser.cel,
					email: loggedUser.email,
				}),
			},
			false,
			true
		);

		if (answer) setFormData(initialValues);
	};

	return (
		<div className='booking' id='booking'>
			<Loading />
			<section className='section-book' id='section-booking'>
				<div className='row'>
					<div className='book'>
						<div className='book__form'>
							<form
								onSubmit={onSubmit}
								/* action='https://formspree.io/f/mzbydvqa'
								method='POST' */
								className='form'
								id='form'
							>
								<div className='u-margin-bottom-6 booking-title'>
									<h2 className='booking-title-heading'>Contact Us</h2>
									<h3 className='booking-title-subheading'>
										Let us know a little bit about your project and we'll take
										it from there.
									</h3>
								</div>
								<Alert type='1' />
								{!loggedUser && (
									<>
										<div className='form__group'>
											<div className='form__group-sub'>
												<div className='form__group-sub-item'>
													<input
														type='text'
														className='form__input'
														value={name}
														onChange={onChange}
														name='name'
														placeholder='First Name'
														id='name'
														required
													/>
													<label htmlFor='nafme' className='form__label'>
														First Name
													</label>
												</div>
												<div className='form__group-sub-item'>
													<input
														type='text'
														className='form__input'
														name='lastname'
														value={lastname}
														onChange={onChange}
														placeholder='Last Name'
														id='lastname'
														required
													/>
													<label htmlFor='lastname' className='form__label'>
														Last Name
													</label>
												</div>
											</div>
										</div>
										<div className='form__group'>
											<div className='form__group-sub'>
												<div className='form__group-sub-item'>
													<input
														type='text'
														className='form__input'
														name='phone'
														value={phone}
														onChange={onChange}
														placeholder='Phone'
														id='phone'
														required
													/>
													<label htmlFor='phone' className='form__label'>
														Phone
													</label>
												</div>
												<div className='form__group-sub-item'>
													<input
														type='email'
														className='form__input'
														name='email'
														placeholder='Email Address'
														value={email}
														onChange={onChange}
														id='email'
														required
													/>
													<label htmlFor='email' className='form__label'>
														Email Address
													</label>
												</div>
											</div>
										</div>
									</>
								)}

								<div className='form__group'>
									<input
										type='text'
										className='form__input'
										name='company'
										value={company}
										onChange={onChange}
										placeholder='Company Name'
										id='company'
									/>
									<label htmlFor='company' className='form__label'>
										Company Name
									</label>
								</div>
								<div style={{ width: '100%' }}>
									<label htmlFor='experience' className='form__label'>
										What's Your Experience With Drones?
									</label>
									<select
										id='experience'
										className={`form__input space ${
											experience === '' ? 'empty' : ''
										}`}
										value={experience}
										onChange={onChange}
										name='experience'
									>
										<option value=''>* Select your Experience</option>
										<option value='Own Drones'>Own Drones</option>
										<option value='Use Third Party Drone Services'>
											Use Third Party Drone Services
										</option>
										<option value='Interested in Using Drones'>
											Interested in Using Drones
										</option>
										<option value='Not Interested in Using Drones'>
											Not Interested in Using Drones
										</option>
									</select>
								</div>
								<div className='form__group'>
									<textarea
										type='text'
										value={message}
										onChange={onChange}
										className='form__input'
										name='message'
										placeholder='Tell us About Your Project'
										id='message'
									/>
									<label htmlFor='message' className='form__label'>
										Tell us About Your Project
									</label>
								</div>

								<div className='form__group'>
									<button type='submit' className='btn btn-secondary'>
										Submit &rarr;
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</section>
			{/* <div id='confirmation'>
				<div id='status'>Thanks! Your message has been submitted.</div>
				<div id='error'>
					Sorry! There was a problem with your message. Please try again.
				</div>
			</div>{' '}
			*/}
		</div>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, { sendEmail })(Booking);
