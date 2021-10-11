import React, { useRef, useEffect } from 'react';
import './Footer.scss';
import { Link } from 'react-router-dom';

import NavLogo from '../../../img/logoDRONE-dark-cropped-final.png';

function Footer({ footerHeight }) {
	const ref = useRef();
	const time = new Date();

	useEffect(() => {
		setHeigth();
		// eslint-disable-next-line
	}, []);

	const setHeigth = () => {
		setTimeout(() => {
			footerHeight(ref.current.offsetHeight);
		}, 30);
	};

	window.addEventListener('resize', setHeigth);

	return (
		<div className='footer-container' ref={ref}>
			<section className='social-media'>
				<div className='social-media-wrap'>
					<div className='social-media-wrap-section'>
						<div className='social-icon'>
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
					<div className='social-media-wrap-section'>
						<div className='footer-logo'>
							<a href='#top' className='social-logo'>
								<img src={NavLogo} className='footer-logo' alt='' />
							</a>
						</div>
					</div>
					<div className='social-media-wrap-section'>
						<big className='website-rights'>
							DRONE TAHOE © {time.getFullYear()}
						</big>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Footer;
