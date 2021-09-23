import React from 'react';

import './Portfolio.scss';

const Portfolio = () => {
	return (
		<div className='portfolio'>
			<h1 className='heading-primary'>Portfolio</h1>
			<h2 className='heading-primary-subheading'>
				A few examples of our recent work:
			</h2>
			<div className='portfolio-group'>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://www.youtube.com/embed/rNgGWCJE-w0'
						title='YouTube video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>
						Eagle Rock, featuring 3D Model
					</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://www.youtube.com/embed/foNKSZqSWJc'
						title='YouTube video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>
						Fannette Island, Fantasy Full Moon
					</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://www.youtube.com/embed/QuD7N1Ci6Hs'
						title='YouTube video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>
						'Phoenix Rising', fly-through video
					</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://www.youtube.com/embed/_Ch51ncUPOQ'
						title='YouTube video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>
						'Phoenix Rising', roofing fly-over
					</h2>
				</div>
			</div>
		</div>
	);
};

export default Portfolio;
