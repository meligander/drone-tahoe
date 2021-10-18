import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { updateReservation, makePayment } from '../../actions/reservation';

import Alert from '../layouts/Alert';

const PayPalButton = window.paypal.Buttons.driver('react', { React, ReactDOM });

const PayPal = ({
	reservation,
	updateReservation,
	makePayment,
	setToggleModal,
	auth: { loggedUser },
}) => {
	return (
		<div className='payment'>
			<Alert type='2' />
			{loggedUser.type === 'admin' && (
				<>
					<button
						className='btn btn-tertiary'
						onClick={async () => {
							const answer = await updateReservation(reservation, {
								status: 'pending',
							});
							if (answer) setToggleModal();
						}}
					>
						Pay Cash
					</button>
					<p className='payment-text'>OR</p>
				</>
			)}

			<PayPalButton
				onApprove={async (data, actions) => {
					const order = await actions.order.capture();
					const answer = await updateReservation(reservation, {
						status: 'pending',
						paymentId: order.id,
					});
					if (answer) setToggleModal();
				}}
				createOrder={async () => {
					const payment = await makePayment(reservation);
					return payment.id;
				}}
				onError={(err) => console.log(err)}
			/>
		</div>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, {
	updateReservation,
	makePayment,
})(PayPal);
