import React from 'react';
import './VRM.scss';

import Booking from '../Booking';

import img1 from '../../../img/glenn/Icons/global.png';
import img2 from '../../../img/glenn/Icons/progress.png';
import img3 from '../../../img/glenn/Icons/safety.png';
import Bruin from '../../../img/glenn/partners/small/bruin.jpg';
import Brassfield from '../../../img/glenn/partners/small/brassfield.jpg';
import Corteva from '../../../img/glenn/partners/small/corteva.jpg';
import Mccarthy from '../../../img/glenn/partners/small/mccarthy.jpg';

const VRM = () => {
	return (
		<div>
			<div className='vrm-header' id='vrm'>
				<div className='vrm-header-section'>
					<h1 className='vrm-header-text'>
						Virtual Reality Management with 360 Virtual Walkthrough
					</h1>
					<h2 className='vrm-header-subtext'>
						Unlimited perspectives in one solution.
					</h2>
				</div>
			</div>

			<section className='vrm-benefits'>
				<div className='vrm-benefits-item'>
					<img src={img2} className='vrm-benefits-item-image' alt='global' />
					<div>
						<h3 className='vrm-benefits-item-heading'>
							Complete Site Documentation
						</h3>
						<h5 className='vrm-benefits-item-text'>
							DroneTahoe digitizes your entire site with drones and 360 cameras.
						</h5>
					</div>
				</div>
				<div className='vrm-benefits-item'>
					<img src={img1} className='vrm-benefits-item-image' alt='progress' />
					<div>
						<h3 className='vrm-benefits-item-heading'>
							One Solution for Entire Site Reality
						</h3>
						<h5 className='vrm-benefits-item-text'>
							Analyze drone and 360 data on one mobile platform.
						</h5>
					</div>
				</div>
				<div className='vrm-benefits-item'>
					<img src={img3} className='vrm-benefits-item-image' alt='maps' />
					<div>
						<h3 className='vrm-benefits-item-heading'>
							Increase Safety, Decrease Rework
						</h3>
						<h5 className='vrm-benefits-item-text'>
							Catch issues earlier than ever with visual data.
						</h5>
					</div>
				</div>
			</section>
			<section className='vrm-description'>
				<div className='vrm-description-img img1'></div>

				<p className='vrm-description-text'>
					DroneTahoe takes interior, exterior and aerial imagery of your job
					site and digitizes it into Virtual Reality. Once digitized, your
					entire team can inspect, validate, and comprehend site progress – no
					matter where they are in the world - with a 360° perspective.
				</p>
				<div className='vrm-group'>
					<img src={Bruin} alt='' className='vrm-group-item' />
					<img src={Brassfield} alt='' className='vrm-group-item' />
					<img src={Corteva} alt='' className='vrm-group-item' />
					<img src={Mccarthy} alt='' className='vrm-group-item' />
				</div>
			</section>
			<Booking />
		</div>
	);
};

export default VRM;
