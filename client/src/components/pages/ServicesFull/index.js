import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { loadJobs } from '../../../actions/jobs';
//import { servicesAll } from './data';

import Loading from '../../layouts/Loading';

import './ServicesFull.scss';

const ServicesFull = ({ loadJobs, job: { jobs, loading } }) => {
	useEffect(() => {
		if (loading) loadJobs({});
	}, [loading, loadJobs]);

	return (
		<div className='servicesfull' id='servicesfull'>
			<h2 className='heading-primary'>Our Services</h2>
			<Loading />
			<div className='card-services'>
				{!loading &&
					jobs.map((item, i) => (
						<div className='card' key={i}>
							<div
								className={`card__side card__side--front card__side--front-${
									i + 1
								}`}
							>
								<div className={`card__image card__image--${i + 1}`}>
									&nbsp;
								</div>
								<h4 className='card__heading'>
									<span
										className={`card__heading--span card__heading--span--${
											i + 1
										}`}
									>
										{item.title}
									</span>
								</h4>
							</div>
							<div
								className={`card__side card__side--back card__side--back-${
									i + 1
								}`}
							>
								<div className='card__cta'>
									<div className='card__price-box'>
										<p className='card__price-only'>{item.subtitle}</p>
										<p className='card__price-value'>{item.poptext}</p>
									</div>
									<div className='popup-button'>
										<Link
											to='/booking'
											onClick={() => window.scrollTo(0, 0)}
											className='btn btn-quaternary'
										>
											Contact Us
										</Link>
									</div>
								</div>
							</div>
						</div>
					))}
			</div>
		</div>
	);
};

const mapStateToProps = (state) => ({
	job: state.job,
});

export default connect(mapStateToProps, { loadJobs })(ServicesFull);
