import React, { useEffect } from 'react';
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
}) => {
	const token = match.params.token;

	useEffect(() => {
		activation(token);
	}, [token, activation]);

	return (
		!loading && (
			<div className='activation'>
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
						</>
					)
				)}
			</div>
		)
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, {
	activation,
	clearJobs,
	clearReservations,
})(Activation);
