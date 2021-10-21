import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './About.scss';

const About = ({ clearReservations, clearJobs, auth: { loggedUser } }) => {
	return (
		<section className='about' id='about'>
			<div className='about-text'>
				<h2 className='heading-secondary-gradient'>
					WE’RE DREAMERS, BELIEVERS, &#38; ACHIEVERS
				</h2>
				<p className='about-text-description'>
					Our dream of engineering, building and flying sUAS drones equipped w/
					First Person View (FPV) began in 1976. DRONE TAHOE now has over 50
					combined years of career military & commercial aviation experience.
				</p>
				<p className='about-text-description'>Dreams do come true!</p>

				<div className='about-text-description'>
					<p>Credentials include:</p>
					<ul className='about-credentials'>
						<li className='about-credentials-item'>
							{' '}
							FAA sUAS Pilot Certification{' '}
						</li>
						<li className='about-credentials-item'>
							NTSB Aviation Accident Investigation Certification
						</li>
					</ul>
				</div>
			</div>

			<div className='about-text-link'>
				<Link
					to={
						!loggedUser || (loggedUser && loggedUser.type !== 'admin')
							? '/reservation/0'
							: '/reservations-list'
					}
					onClick={() => {
						clearReservations();
						clearJobs();
						window.scrollTo(0, 0);
					}}
					className='btn'
				>
					{!loggedUser || (loggedUser && loggedUser.type !== 'admin')
						? 'Schedule Your Project Today'
						: 'Reservations'}
				</Link>
			</div>

			<div className='about-image'></div>
		</section>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps)(About);
