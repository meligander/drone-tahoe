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
						src='https://player.vimeo.com/video/630298172?h=481cc9d119&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						frameborder='0'
						allow='autoplay; fullscreen; picture-in-picture'
						allowfullscreen
						title='Phoenix Rising'
					></iframe>
					<h2 className='portfolio-item-caption'>Phoenix Rising</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://player.vimeo.com/video/631210506?h=b5af32c692&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						title='Vimeo video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>Martis House Layout</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://player.vimeo.com/video/643232672?h=ceaec90017&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						title='Vimeo video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>Fannette Island 3D Model</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://player.vimeo.com/video/643238467?h=a248a1f339&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						title='Vimeo video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>
						Emerald Bay Teahouse Fantasy Full Moon
					</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://player.vimeo.com/video/631124253?h=8cccc7bfec&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						title='Vimeo video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>
						Phoenix Rising Roof Barcode
					</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://player.vimeo.com/video/643418675?h=544a013c78&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						title='Vimeo video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>Emerald Bay & Granite Lake</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://player.vimeo.com/video/643385157?h=ae7d4a6f15&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						title='Vimeo video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>Eagle Falls 2021</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://player.vimeo.com/video/643244364?h=ebcd7c5215&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						title='Vimeo video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>Lake Azure</h2>
				</div>
				<div className='portfolio-group-item'>
					<iframe
						className='portfolio-item'
						src='https://player.vimeo.com/video/643279221?h=25bb357e5c&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'
						title='Vimeo video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
						allowFullScreen
					></iframe>
					<h2 className='portfolio-item-caption'>
						South Yuba River Running #1
					</h2>
				</div>
			</div>
		</div>
	);
};

export default Portfolio;
