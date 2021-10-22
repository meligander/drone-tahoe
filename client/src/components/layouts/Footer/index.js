import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { setFooterHeight } from '../../../actions/global';

import NavLogo from '../../../img/logoDRONE-dark-cropped-final.png';

import './Footer.scss';

function Footer({ setFooterHeight }) {
	const ref = useRef();
	const time = new Date();

	useEffect(() => {
		setTimeout(() => {
			setFooterHeight(ref.current.offsetHeight);
		}, 50);
	}, [setFooterHeight]);

	return (
		<div className='footer-container' ref={ref}>
			<section className='social-media'>
				<div className='social-media-wrap'>
					<div className='social-media-wrap-section'>
						<big className='website-rights'>
							DRONE TAHOE © {time.getFullYear()}
						</big>
					</div>
					<div className='social-media-wrap-section'>
						<div className='footer-logo'>
							<Link
								to='/'
								onClick={() => window.scrollTo(0, 0)}
								className='social-logo'
							>
								<img src={NavLogo} className='footer-logo' alt='' />
							</Link>
						</div>
					</div>
					<div className='social-media-wrap-section'>
						<div className='social-icon'>
							<Link
								className='social-icon-link facebook'
								to={{
									pathname:
										'https://www.facebook.com/profile.php?id=100054789366613',
								}}
								target='_blank'
								aria-label='Facebook'
							>
								<i className='fab fa-facebook-f' />
							</Link>
							<Link
								className='social-icon-link instagram'
								to={{ pathname: 'https://www.instagram.com/dronetahoe/' }}
								target='_blank'
								aria-label='Instagram'
							>
								<i className='fab fa-instagram' />
							</Link>
							<Link
								className='social-icon-link youtube'
								to={{ pathname: 'https://www.youtube.com/user/laketahoeG' }}
								target='_blank'
								aria-label='Youtube'
							>
								<i className='fab fa-youtube' />
							</Link>
							<Link
								className='social-icon-link twitter'
								to={{ pathname: 'https://twitter.com/Drone_Tahoe' }}
								target='_blank'
								aria-label='Twitter'
							>
								<i className='fab fa-twitter' />
							</Link>
							{/* <Link
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

export default connect(null, { setFooterHeight })(Footer);
