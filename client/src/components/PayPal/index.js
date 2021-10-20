import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { updatePayment, makePayment } from '../../actions/reservation';

import Alert from '../layouts/Alert';

const PayPalButton = window.paypal.Buttons.driver('react', { React, ReactDOM });

const PayPal = ({
	reservation,
	updatePayment,
	makePayment,
	setToggleModal,
	auth: { loggedUser },
}) => {
	return (
		<div className='payment'>
			<h3 className='heading-primary-subheading'>
				Reservation Payment: &nbsp; ${reservation && reservation.value}
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
					const payment = await makePayment(reservation);
					return payment.id;
				}}
				onApprove={async (data, actions) => {
					const order = await actions.order.capture();

					const answer = await updatePayment(reservation.id, {
						paymentId: order.id,
					});
					if (answer) setToggleModal();
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
	updatePayment,
	makePayment,
})(PayPal);
