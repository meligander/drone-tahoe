import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

import { loadJobs } from '../../../actions/jobs';
import {
	loadReservations,
	cancelReservation,
	updateStatus,
} from '../../../actions/reservation';

import Alert from '../../layouts/Alert';
import Loading from '../../layouts/Loading';
import PopUp from '../../layouts/PopUp';

import './Reservation.scss';
import ReservationForm from '../../ReservationForm';

const Reservation = ({
	auth: { loggedUser, token },
	reservation: { reservations, loading: loadingReservations },
	job: { loading },
	loadJobs,
	loadReservations,
	cancelReservation,
	updateStatus,
	match,
}) => {
	const [adminValues, setAdminValues] = useState({
		reservation: null,
		toggleModal: false,
	});

	const { reservation, toggleModal } = adminValues;

	useEffect(() => {
		if (loading) loadJobs({}, token ? true : false);
		if (loggedUser && loggedUser.type !== 'admin' && loadingReservations) {
			loadReservations({ hourFrom: new Date(), user: loggedUser.id }, true);
			updateStatus();
		}
	}, [
		loading,
		loadJobs,
		loggedUser,
		loadReservations,
		loadingReservations,
		token,
		match.params.job_id,
		updateStatus,
	]);

	return (
		<div className='reservation'>
			<Loading />
			<h2 className='heading-primary'>Reservations</h2>
			<PopUp
				type='confirmation'
				toggleModal={toggleModal}
				setToggleModal={() =>
					setAdminValues((prev) => ({
						...prev,
						toggleModal: !toggleModal,
					}))
				}
				confirm={() => {
					cancelReservation(reservation.id);
				}}
				text='Are you sure you want to cancel the reservation?'
				subtext='An email will be sent to the admin asking for a refund.'
			/>
			<Alert type='1' />
			{!loggedUser ? (
				<h5 className='heading-primary-subheading error'>
					You need to be logged in to make a reservation. &nbsp;
					<Link
						to='/login'
						onClick={() => window.scrollTo(0, 0)}
						className='btn-link'
					>
						Login
					</Link>
				</h5>
			) : (
				loggedUser.cel === '0' && (
					<h5 className='heading-primary-subheading error'>
						You need to save your cellphone in your profile to make a
						reservation. &nbsp;
						<Link
							to='/profile'
							onClick={() => window.scrollTo(0, 0)}
							className='btn-link'
						>
							Profile
						</Link>
					</h5>
				)
			)}
			{loggedUser && (
				<>
					<div className='reservation-list'>
						{!loadingReservations && reservations.length > 0 ? (
							reservations.map((res) => (
								<div className='reservation-item' key={res.id}>
									<div className='reservation-item-date'>
										<Moment
											date={res.hourFrom}
											className='date'
											format='MM-DD-YY'
										/>
										<Moment date={res.hourFrom} utc format='h a' /> -{' '}
										<Moment date={res.hourTo} utc format='h a' />
									</div>
									<div className='reservation-item-job'>
										<p>
											<span className='reservation-item-title'>Job: </span>{' '}
											{res.job.title}
										</p>
										<p>
											<span className='reservation-item-title'>Value: </span> $
											{res.value}
										</p>
										{res.status !== 'completed' && (
											<p>
												<span className='reservation-item-title'>Status: </span>
												{res.status.charAt(0).toUpperCase() +
													res.status.slice(1)}
											</p>
										)}
									</div>
									{res.status !== 'canceled' && (
										<div className='reservation-item-icons'>
											<button
												onClick={() =>
													setAdminValues((prev) => ({
														...prev,
														reservation: res,
													}))
												}
												className='btn-icon'
											>
												<i className='far fa-edit'></i>
											</button>
											<button
												onClick={() =>
													setAdminValues((prev) => ({
														...prev,
														toggleModal: !toggleModal,
														reservation: res,
													}))
												}
												className='btn-icon'
											>
												<i className='far fa-trash-alt'></i>
											</button>
										</div>
									)}
								</div>
							))
						) : (
							<h2 className='heading-primary-subheading'>
								No Reservations Made
							</h2>
						)}
					</div>
					{!loading && (
						<ReservationForm
							reservation={reservation}
							complete={() =>
								setAdminValues((prev) => ({ ...prev, reservation: null }))
							}
							jobId={match.params.job_id !== '0' ? match.params.job_id : null}
						/>
					)}
				</>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	job: state.job,
	reservation: state.reservation,
});

export default connect(mapStateToProps, {
	loadJobs,
	loadReservations,
	cancelReservation,
	updateStatus,
})(Reservation);
