import React from 'react';
import { Link } from 'react-router-dom';

import ServicesItem from './ServicesItem';
import './ServicesSection.scss';

import Construction from '../../img/small/services/construction.jpg';
import Inspection from '../../img/small/services/inspection.jpg';
import Roofing from '../../img/small/services/elevation-map.jpg';

// import FAA from "../../img/faa-cropped.png";
// import Insurance from "../../img/insurance-cropped.png";

const ServicesSection = () => {
	return (
		<div className='services-section' id='services'>
			<Link
				to='/servicesfull'
				onClick={() => window.scrollTo(0, 0)}
				className='services-heading-link'
			>
				<h2 className='services-heading'>Services</h2>
			</Link>
			<div className='services-section-items'>
				<ServicesItem
					image={Construction}
					title='Construction'
					details='Create accurate, high-resolution digital replicas with 3D models, real-time 2D maps, and 360 virtual tours for any construction site.'
					job='3'
				/>
				<ServicesItem
					image={Inspection}
					title='Inspection'
					details='Commercial, Residential, Architecture, Legal, Resort, Tall Structures, Towers, Live View! (UHD)'
					job='4'
				/>
				<ServicesItem
					image={Roofing}
					title='Mapping'
					details='Mapping of any size parcel. Accurate to 1”.'
					job='1'
				/>
			</div>
			<div>
				<Link
					to='/servicesfull'
					onClick={() => window.scrollTo(0, 0)}
					className='btn'
				>
					See All Services
				</Link>
			</div>
		</div>
	);
};

export default ServicesSection;
