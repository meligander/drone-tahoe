import React from 'react';
import './Footer.scss';
import { Link } from 'react-router-dom';

import NavLogo from '../../../img/logoDRONE-dark-cropped-final.png';

function Footer() {
	return (
		<div className='footer-container'>
			<div className='footer-links'>
				<div className='footer-link-wrapper'>
					{/* <div className="footer-link-items">
            <h2>About</h2>
            <Link className="footer-link-items-link" to="/signup">
              How it works
            </Link>
            <Link className="footer-link-items-link" to="/">
              Testimonials
            </Link>
            <Link className="footer-link-items-link" to="/">
              Privacy Policy
            </Link>
            <Link className="footer-link-items-link" to="/">
              Terms of Service
            </Link>
          </div> */}
					{/* <div className="footer-link-items">
            <h2>Navigation</h2>
            <Link className="footer-link-items-link" to="/vrm">
              VRM
            </Link>
            <Link className="footer-link-items-link" to="/servicesfull">
              Our Services
            </Link>
            <Link className="footer-link-items-link" to="/portfolio">
              Portfolio
            </Link>
            <Link className="footer-link-items-link" to="/contact">
              Contact Us
            </Link>
          </div> */}
				</div>
				{/* <div className="footer-link-wrapper">
          <div className="footer-link-items">
            <h2>Videos</h2>
            <Link className="footer-link-items-link" to="/">
              Submit Video
            </Link>
            <Link className="footer-link-items-link" to="/">
              Ambassadors
            </Link>
            <Link className="footer-link-items-link" to="/">
              Agency
            </Link>
            <Link className="footer-link-items-link" to="/">
              Influencer
            </Link>
          </div>
        </div> */}
			</div>
			<section className='social-media'>
				<div className='social-media-wrap'>
					<div className='social-media-wrap-section'>
						<big className='website-rights'>DRONE TAHOE © 2021</big>
					</div>
					<div className='social-media-wrap-section'>
						<div className='footer-logo'>
							<a href='#top' className='social-logo'>
								<img src={NavLogo} className='footer-logo' alt='' />
							</a>
						</div>
					</div>
					<div className='social-media-wrap-section'>
						<div className='social-icons'>
							{/* <Link
              className='social-icon-link facebook'
              to='/'
              target='_blank'
              aria-label='Facebook'
            >
              <i className='fab fa-facebook-f' />
            </Link>
            <Link
              className='social-icon-link instagram'
              to='/'
              target='_blank'
              aria-label='Instagram'
            >
              <i className='fab fa-instagram' />
            </Link> */}
							<Link
								className='social-icon-link youtube'
								to={{ pathname: 'https://www.youtube.com/user/laketahoeG' }}
								target='_blank'
								aria-label='Youtube'
							>
								<i className='fab fa-youtube' />
							</Link>
							{/* <Link
              className='social-icon-link twitter'
              to='/'
              target='_blank'
              aria-label='Twitter'
            >
              <i className='fab fa-twitter' />
            </Link>
            <Link
              className='social-icon-link twitter'
              to='/'
              target='_blank'
              aria-label='LinkedIn'
            >
              <i className='fab fa-linkedin' />
            </Link> */}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Footer;
