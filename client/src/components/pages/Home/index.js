import React from 'react';
import { connect } from 'react-redux';

import HeroSection from '../../HeroSection';
import About from '../../About';
import ServicesSection from '../../Services';
import Testimonials from '../../Testimonials';
import Booking from '../Booking';

import { clearReservations } from '../../../actions/reservation';
import { clearJobs } from '../../../actions/jobs';

const Home = ({ clearReservations, clearJobs }) => {
	return (
		<div>
			<HeroSection
				clearJobs={clearJobs}
				clearReservations={clearReservations}
			/>
			<ServicesSection />
			<About clearJobs={clearJobs} clearReservations={clearReservations} />
			<Testimonials />
			<Booking />
		</div>
	);
};

export default connect(null, { clearJobs, clearReservations })(Home);
