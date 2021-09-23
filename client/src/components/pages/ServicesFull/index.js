import React from 'react';
import { Link } from 'react-router-dom';
import { servicesAll } from './data';

import './ServicesFull.scss';

const ServicesFull = () => {
	return (
		<div className='servicesfull' id='servicesfull'>
			<h2 className='heading-primary'>Our Services</h2>

			<div className='card-services'>
				{servicesAll.map((item, i) => (
					<div className='card' key={i}>
						<div
							className={`card__side card__side--front card__side--front-${
								i + 1
							}`}
						>
							<div className={`card__image card__image--${i + 1}`}>&nbsp;</div>
							<h4 className='card__heading'>
								<span
									className={`card__heading--span card__heading--span--${
										i + 1
									}`}
								>
									{item.heading}
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
									<p className='card__price-only'>{item.subheading}</p>
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

export default ServicesFull;
