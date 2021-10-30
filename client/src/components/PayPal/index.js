import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { updatePayment, makePayment } from '../../actions/reservation';
import {
	loadReservationJobs,
	clearJobsXReservations,
} from '../../actions/jobsXReservations';

import Alert from '../layouts/Alert';

const PayPalButton = window.paypal.Buttons.driver('react', { React, ReactDOM });

const PayPal = ({
	reservation,
	loadReservationJobs,
	clearJobsXReservations,
	updatePayment,
	makePayment,
	setToggleModal,
	auth: { loggedUser },
	jobsXreservation: { jobsXreservations, loading },
}) => {
	useEffect(() => {
		if (loading && reservation) loadReservationJobs(reservation.id, 'full');
	}, [loading, reservation, loadReservationJobs]);

	return (
		<div className='payment'>
			<h3 className='heading-primary-subheading'>
				Reservation Payment: &nbsp; ${reservation && reservation.total}
			</h3>
			<Alert type='2' />
			{loggedUser && loggedUser.type === 'admin' && (
				<>
					<button
						className='btn btn-tertiary'
						onClick={async () => {
							const answer = await updatePayment(reservation.id);
							if (answer) setToggleModal();
						}}
					>
						Pay Cash
					</button>
					<p className='payment-text'>OR</p>
				</>
			)}

			<PayPalButton
				createOrder={async () => {
					const payment = await makePayment({
						jobs: [
							...jobsXreservations,
							{
								value: reservation.travelExpenses,
								job: { title: 'Travel Expenses' },
								discount: null,
							},
						],
						total: reservation.total,
					});
					console.log(payment);
					return payment.id;
				}}
				onApprove={async (data, actions) => {
					const order = await actions.order.capture();
					const answer = await updatePayment(reservation.id, {
						paymentId: order.id,
					});
					if (answer) {
						setToggleModal();
						clearJobsXReservations();
					}
				}}
				onError={(err) => console.log(err)}
			/>
		</div>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
	jobsXreservation: state.jobsXreservation,
});

export default connect(mapStateToProps, {
	updatePayment,
	makePayment,
	loadReservationJobs,
	clearJobsXReservations,
})(PayPal);
