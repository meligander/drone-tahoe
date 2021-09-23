import React from 'react';
import './Contact.scss';

import Booking from '../Booking';

export default function Contact() {
	React.useEffect(() => {
		window.scrollTo(0, 0);
	});

	return (
		<div>
			<div className='contact'>
				<h1 className='contact-heading'>Get in Touch with Us.</h1>
				<h3 className='contact-subheading'>
					Do not hesitate to reach out with any questions. We'll be in touch.
				</h3>
			</div>
			<Booking />
		</div>
	);
}
