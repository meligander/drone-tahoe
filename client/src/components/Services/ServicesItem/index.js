import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { clearReservations } from '../../../actions/reservation';
import { clearJobs } from '../../../actions/jobs';

const Services = ({
	image,
	title,
	details,
	job,
	clearReservations,
	clearJobs,
}) => {
	return (
		<div className='services-section-item'>
			<img src={image} className='services-section-item-image' alt='' />

			<div className='services-section-item-text'>
				<h3 className='services-section-item-heading'>{title}</h3>
				<div className='services-section-item-sub'>
					<h5 className='services-section-item-sub-details'>{details}</h5>
					<Link
						to={`/reservation/${job}`}
						onClick={() => {
							clearReservations();
							clearJobs();
						}}
						className='btn btn-tertiary'
					>
						Book Now
					</Link>
				</div>
			</div>
		</div>
	);
};

export default connect(null, { clearReservations, clearJobs })(Services);
