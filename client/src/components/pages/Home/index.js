import React from 'react';
import { connect } from 'react-redux';

import HeroSection from '../../HeroSection';
import About from '../../About';
import ServicesSection from '../../Services';
import Testimonials from '../../Testimonials';
import Booking from '../Booking';

import { clearReservations } from '../../../actions/reservation';
import { clearJobs } from '../../../actions/jobs';

const Home = ({ clearReservations, clearJobs, auth: { loggedUser } }) => {
	return (
		<div>
			<HeroSection
				clearJobs={clearJobs}
				clearReservations={clearReservations}
			/>
			<ServicesSection />
			<About clearJobs={clearJobs} clearReservations={clearReservations} />
			<Testimonials />
			{(!loggedUser || (loggedUser && loggedUser.type !== 'admin')) && (
				<Booking />
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, { clearJobs, clearReservations })(Home);
