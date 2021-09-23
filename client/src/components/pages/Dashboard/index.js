import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

import { loadReservations } from '../../../actions/reservation';

import './Dashboard.scss';

const Dashboard = ({
	loadReservations,
	reservation: { reservations, loading },
}) => {
	useEffect(() => {
		if (loading) loadReservations({ hourFrom: new Date() });
	}, [loadReservations, loading]);

	return (
		<div className='dashboard'>
			<div className='dashboard-date'>
				<i className='fas fa-calendar-day'></i> &nbsp;
				<Moment format='dddd, MMMM Do YYYY' />
			</div>
			<h4 className='dashboard-info'>
				Number of Reservations: {reservations.length}
			</h4>
			<h4 className='heading-primary-subheading'>Upcomming Reservations</h4>
			<table>
				<tbody>
					{!loading &&
						reservations.length > 0 &&
						reservations.map(
							(reservation, i) =>
								i < 5 && (
									<React.Fragment key={reservation.id}>
										<tr>
											<td>
												<Moment
													date={reservation.hourFrom}
													format='MM/DD/YY'
													utc
												/>
											</td>
											<td>
												<Moment date={reservation.hourFrom} format='H a' utc />
											</td>
											<td>
												<Moment date={reservation.hourTo} format='H a' utc />
											</td>
											<td>
												{`${reservation.user.name} ${reservation.user.lastname}`}
											</td>
											<td>{reservation.job.title}</td>
										</tr>
									</React.Fragment>
								)
						)}
				</tbody>
			</table>
			<div className='dashboard-btns'>
				<Link to='/reservation-list' className='btn'>
					See All
				</Link>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => ({
	reservation: state.reservation,
});

export default connect(mapStateToProps, { loadReservations })(Dashboard);
