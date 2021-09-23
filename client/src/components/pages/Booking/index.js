import React, { useEffect } from 'react';

import './Booking.scss';

const Booking = () => {
	// var status = document.getElementById("status");
	// var confirmation = document.getElementById("confirmation");

	// function displayConfirmation(res) {
	//   status.style.visibility = "visible";
	//   confirmation.style.visibility = "visible";
	// status.classList.add("status");
	// status.innerHTML = "Thanks! Your message has been submitted.";
	// }
	// function heightCheck() {
	//   var box = document.getElementById("section-booking");
	//   var section = document.getElementById("booking");
	//   var boxHeight = box.clientHeight;
	//   console.log(boxHeight);
	//   // section.style.height = boxHeight +
	// }

	// heightCheck();

	useEffect(() => {
		var form = document.getElementById('form');

		async function handleSubmit(event) {
			event.preventDefault();
			var status = document.getElementById('status');
			var confirmation = document.getElementById('confirmation');
			var error1 = document.getElementById('error');

			// function displayConfirmation(res) {
			//   status.style.visibility = "visible";
			//   confirmation.style.visibility = "visible";
			//   // status.classList.add("status");
			//   // status.innerHTML = "Thanks! Your message has been submitted.";
			// }
			// function removeConfirmation(res) {
			//   status.style.visibility = "hidden";
			//   confirmation.style.visibility = "hidden";
			//   // status.classList.add("status");
			//   // status.innerHTML = "Thanks! Your message has been submitted.";
			// }
			var data = new FormData(event.target);
			fetch(event.target.action, {
				method: form.method,
				body: data,
				headers: {
					Accept: 'application/json',
				},
			})
				.then((response) => {
					form.reset();
					status.style.display = 'block';
					confirmation.style.display = 'block';
					setTimeout(function () {
						status.style.display = 'none';
						confirmation.style.display = 'none';
					}, 3000);
				})
				.catch((error) => {
					error1.style.display = 'block';
					confirmation.style.display = 'block';
					setTimeout(function () {
						error1.style.display = 'none';
						confirmation.style.display = 'none';
					}, 3000);
				});
		}
		form.addEventListener('submit', handleSubmit);
	}, []);

	return (
		<div className='booking' id='booking'>
			<section className='section-book' id='section-booking'>
				<div className='row'>
					<div className='book'>
						<div className='book__form'>
							<form
								action='https://formspree.io/f/mzbydvqa'
								method='POST'
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
								<div className='form__group'>
									<div className='form__group-sub'>
										<div className='form__group-sub-item'>
											<input
												type='text'
												className='form__input'
												name='fname'
												placeholder='First Name'
												id='fname'
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
												name='lname'
												placeholder='Last Name'
												id='lname'
												required
											/>
											<label htmlFor='lname' className='form__label'>
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
												id='email'
												required
											/>
											<label htmlFor='email' className='form__label'>
												Email Address
											</label>
										</div>
									</div>
								</div>
								<div className='form__group'>
									<input
										type='text'
										className='form__input'
										name='company'
										placeholder='Company Name'
										id='company'
									/>
									<label htmlFor='company' className='form__label'>
										Company Name
									</label>
								</div>
								<div className='form__group'>
									<label htmlFor='experience' className='form__label'>
										What's Your Experience With Drones?
									</label>

									<select id='experience' name='experience'>
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
									<button className='btn btn-secondary'>Submit &rarr;</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</section>
			<div id='confirmation'>
				<div id='status'>Thanks! Your message has been submitted.</div>
				<div id='error'>
					Sorry! There was a problem with your message. Please try again.
				</div>
			</div>
		</div>
	);
};

export default Booking;
