import React from 'react';

import './Testimonials.scss';

import Bruin from '../../img/glenn/partners/small/bruin.jpg';
import Brassfield from '../../img/glenn/partners/small/brassfield.jpg';
import Corteva from '../../img/glenn/partners/small/corteva.jpg';
import Mccarthy from '../../img/glenn/partners/small/mccarthy.jpg';
import TahoeNalu from '../../img/glenn/partners/tahoenalu.jpg';
import TahoeGal from '../../img/glenn/partners/tahoegal.jpg';
import TahoeYachtClub from '../../img/glenn/partners/tahoeyachtclub.jpg';
import TGMA from '../../img/glenn/partners/tgma.jpg';
import EAA from '../../img/glenn/partners/eaa.jpg';
import GreyBlue from '../../img/glenn/partners/greybluerealty.jpg';

const Testimonials = () => {
	return (
		<div className='testimonials'>
			<div className='testimonials-clients'>
				<h2 className='testimonials-clients-heading'>Clients</h2>
				<p className='testimonials-clients-subheading'>
					We have recently worked with the following satisfied clients:
				</p>
				<div className='testimonials-clients-group'>
					<img
						src={TahoeNalu}
						alt='Tahoe Nalu'
						className='testimonials-clients-group-item gray'
					/>
					<img
						src={Brassfield}
						alt='Brass Field'
						className='testimonials-clients-group-item'
					/>
					<img
						src={TahoeYachtClub}
						alt='Tahoe Yacth Club'
						className='testimonials-clients-group-item gray'
					/>
					<img
						src={Mccarthy}
						alt='Mccarthy'
						className='testimonials-clients-group-item'
					/>
					<img
						src={TahoeGal}
						alt='Tahoe Gal'
						className='testimonials-clients-group-item gray'
					/>
				</div>
				{/* <div className="testimonials-clients-group"> */}
				{/* <img
            src={DorrisEaton}
            alt=""
            className="testimonials-clients-group-item gray"
          /> */}
				{/* </div> */}
				<div className='testimonials-clients-group'>
					<img
						src={EAA}
						alt='EAA'
						className='testimonials-clients-group-item gray'
					/>
					<img
						src={GreyBlue}
						alt='Grey Blue'
						className='testimonials-clients-group-item gray'
					/>

					<img
						src={Corteva}
						alt='Corteva'
						className='testimonials-clients-group-item'
					/>
					<img
						src={TGMA}
						alt='TGMA'
						className='testimonials-clients-group-item gray'
					/>

					<img
						src={Bruin}
						alt='Bruin'
						className='testimonials-clients-group-item smaller'
					/>
				</div>
			</div>
			{/* <div>
        <Link to="/clients" className="testimonials-button">
          See All Clients
        </Link>
      </div> */}

			{/* <hr className="testimonials-line" />
      <p className="testimonials-text">
        "Drone Tahoe did an amazing job with my project! Consectetur adipisicing
        elit. Animi in quod recusandae obcaecati nihil at eaque! Velit ipsum
        unde id ex cupiditate eligendi? At eaque unde, reprehenderit voluptates
        ad quaerat veritatis temporibus quis, sed et magni excepturi nobis
        repellendus perspiciatis officia ex animi accusantium ipsum rem maxime.
        Possimus, saepe, minus doloribus deserunt repellat modi nobis rem nemo
        cum minima temporibus!"
      </p>
      <p className="testimonials-author">-Joe Miller, BMI Construction</p>
      <hr className="testimonials-line" /> */}
		</div>
	);
};

export default Testimonials;
