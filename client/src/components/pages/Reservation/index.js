import React, { useEffect, useState, useRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import { loadJobs } from '../../../actions/jobs';
import {
	loadReservations,
	deleteReservation,
} from '../../../actions/reservation';
import { clearJobsXReservations } from '../../../actions/jobsXReservations';

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
	deleteReservation,
	clearJobsXReservations,
	match,
}) => {
	const list = useRef();

	const [adminValues, setAdminValues] = useState({
		reservation: null,
		toggleModal: false,
		position: 0,
		editReservation:
			match.params.job_id && match.params.job_id !== '0' ? true : false,
		checkout: false,
	});

	const { reservation, toggleModal, position, editReservation, checkout } =
		adminValues;

	useEffect(() => {
		if (loading && token) loadJobs({}, true);
		if (loggedUser && loggedUser.type !== 'admin' && loadingReservations)
			loadReservations({ hourFrom: new Date(), user: loggedUser.id }, true);
	}, [
		loading,
		loadJobs,
		loggedUser,
		loadReservations,
		loadingReservations,
		token,
	]);

	useEffect(() => {
		if (!loadingReservations) {
			const item = list.current.getBoundingClientRect();
			const scrollTop =
				window.pageYOffset || document.documentElement.scrollTop;

			setAdminValues((prev) => ({
				...prev,
				position: item.bottom + scrollTop - 60,
			}));
			if (match.params.job_id && match.params.job_id !== '0')
				setTimeout(() => {
					window.scrollTo(0, item.bottom + scrollTop);
				}, 30);
		}
	}, [loadingReservations, match.params.job_id]);

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
					deleteReservation(reservation);
					setAdminValues((prev) => ({ ...prev, reservation: null }));
				}}
				text={`Are you sure you want to ${
					reservation && reservation.status !== 'paid' ? 'delete' : 'cancel'
				} the reservation?`}
				subtext={
					reservation && reservation.status === 'paid'
						? 'A refund will be placed through paypal.'
						: ''
				}
			/>
			{checkout && (
				<PopUp
					type='payment'
					toUpdate={reservation}
					setToggleModal={() =>
						setAdminValues((prev) => ({
							...prev,
							checkout: false,
							reservation: null,
						}))
					}
					clearJobs={clearJobsXReservations}
					toggleModal={checkout}
				/>
			)}

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
				<Fragment>
					<div className='reservation-list' ref={list}>
						{!loadingReservations && reservations.length > 0 ? (
							reservations.map((res, i) => (
								<div className='reservation-item' key={res.id}>
									<div className='reservation-item-date'>
										<span className='date'>
											{format(new Date(res.hourFrom.slice(0, -1)), 'MM/dd/yy')}
										</span>
										{format(new Date(res.hourFrom.slice(0, -1)), 'h aaa')} -{' '}
										{format(new Date(res.hourTo.slice(0, -1)), 'h aaa')}
									</div>
									<div className='reservation-item-status'>
										<p>
											<span className='reservation-item-title'>Address: </span>
											{res.address}
										</p>
										<p>
											<span className='reservation-item-title'>Value: </span>
											{res.total ? '$' + res.total : 'Pending'}
										</p>
										<p>
											<span className='reservation-item-title'>Status: </span>
											{res.status.charAt(0).toUpperCase() + res.status.slice(1)}
										</p>
									</div>
									<div className='reservation-item-icons'>
										{res.status === 'unpaid' && (
											<div className='tooltip'>
												<button
													onClick={() => {
														setAdminValues((prev) => ({
															...prev,
															reservation: res,
															checkout: true,
														}));
													}}
													className='btn-icon'
												>
													<i className='fas fa-dollar-sign'></i>
												</button>
												<span className='tooltiptext'>Pay</span>
											</div>
										)}
										<div className='tooltip'>
											<button
												onClick={() => {
													setAdminValues((prev) => ({
														...prev,
														reservation: res,
														editReservation: true,
													}));

													setTimeout(() => {
														window.scrollTo(0, position);
													}, 30);
												}}
												className='btn-icon'
											>
												{res.status !== 'refunded' &&
												res.status !== 'canceled' ? (
													<i className='far fa-edit'></i>
												) : (
													<i className='fas fa-search'></i>
												)}
											</button>
											<span className='tooltiptext'>
												{res.status !== 'refunded' && res.status !== 'canceled'
													? 'Edit'
													: 'See details'}
											</span>
										</div>
										{(res.status === 'requested' ||
											res.status === 'unpaid') && (
											<div className='tooltip'>
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
												<span className='tooltiptext'>Delete</span>
											</div>
										)}
									</div>
								</div>
							))
						) : (
							<h2 className='heading-primary-subheading'>
								No Reservations Made
							</h2>
						)}
					</div>
					{!loading && loggedUser.cel !== '0' && (
						<Fragment>
							{!editReservation ? (
								<div className='btn-right'>
									<button
										onClick={() => {
											setAdminValues((prev) => ({
												...prev,
												editReservation: true,
											}));
											setTimeout(() => {
												window.scrollTo(0, position);
											}, 30);
										}}
										className='btn btn-primary'
									>
										<i className='fas fa-plus'></i> &nbsp; Reservation
									</button>
								</div>
							) : (
								<ReservationForm
									reservation={reservation}
									setToggleModal={() =>
										setAdminValues((prev) => ({
											...prev,
											reservation: null,
											editReservation: false,
										}))
									}
								/>
							)}
						</Fragment>
					)}
				</Fragment>
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
	deleteReservation,
	clearJobsXReservations,
})(Reservation);
