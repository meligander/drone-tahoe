import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { activation } from '../../../actions/auth';
import { clearReservations } from '../../../actions/reservation';
import { clearJobs } from '../../../actions/jobs';

import './Activation.scss';

const Activation = ({
	match,
	auth: { loading, loggedUser, error },
	activation,
	clearJobs,
	clearReservations,
	global: { footer, navbar },
}) => {
	const token = match.params.token;
	const container = useRef();

	const [adminValues, setAdminValues] = useState({
		float: true,
	});

	const { float } = adminValues;

	useEffect(() => {
		activation(token);
	}, [token, activation]);

	useEffect(() => {
		if (container.current) {
			const item = container.current.getBoundingClientRect();

			if (item.height + footer + navbar + 60 >= window.innerHeight)
				setAdminValues((prev) => ({
					...prev,
					float: false,
				}));
		}
	}, [footer, navbar]);

	return (
		!loading && (
			<div ref={container} className={`activation ${float ? 'float' : ''}`}>
				{error !== '' ? (
					<>
						<h2 className='activation-error-header'>
							Ups... something went wrong!
						</h2>
						<p className='activation-error-text'>{error.msg}</p>
					</>
				) : (
					loggedUser !== null && (
						<>
							<h2 className='heading-secondary-gradient'>
								Welcome {loggedUser.name + ' ' + loggedUser.lastname}!
							</h2>
							<p className='activation-text'>
								Welcome to Drone Tahoe! You can start using our services now.
							</p>
							<div className='btn-center'>
								<Link
									to='/reservation/0'
									onClick={() => {
										clearJobs();
										clearReservations();
										window.scrollTo(0, 0);
									}}
									className='btn btn-primary'
								>
									Book now
								</Link>
							</div>
						</>
					)
				)}
			</div>
		)
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	global: state.global,
});

export default connect(mapStateToProps, {
	activation,
	clearJobs,
	clearReservations,
})(Activation);
