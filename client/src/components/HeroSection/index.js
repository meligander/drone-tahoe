import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.scss';

import Logo from '../../img/logoDRONE-dark-cropped-final.png';
import HeroVideo from '../../img/glenn/landing-video.m4v';

const HeroSection = ({ clearReservations, clearJobs }) => {
	return (
		<div className='hero-container'>
			<video
				className='hero-container-video'
				src={HeroVideo}
				autoPlay
				loop
				muted
				playsInline
			/>
			<div className='hero-container-image'></div>
			<div className='hero-box'>
				<div className='hero-container-logo'>
					<img src={Logo} alt='' className='hero-container-logo-img' />
				</div>
				<p className='hero-subheading'>
					Drone Mapping, Inspection, and Walkthrough Services in North Lake
					Tahoe
				</p>
				<div className='hero-button'>
					<Link
						to='/reservation/0'
						onClick={() => {
							clearReservations();
							clearJobs();
							window.scrollTo(0, 0);
						}}
						className='btn btn-primary'
					>
						Schedule Now
					</Link>
				</div>
			</div>
			<div className='hero-bottom'>
				360 Virtual Walkthrough brings drone data + 360 videos and photos into
				one solution -{' '}
				<span>
					<Link to='/vrm' className='btn-link'>
						Learn More
					</Link>
				</span>
			</div>
		</div>
	);
};

export default HeroSection;
