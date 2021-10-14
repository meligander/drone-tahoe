import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import { updateReservation, makePayment } from '../../actions/reservation';

import Alert from '../layouts/Alert';

const PayPal = ({
	reservation,
	updateReservation,
	makePayment,
	setToggleModal,
	auth: { loggedUser },
}) => {
	const paypal = useRef();

	useEffect(() => {
		window.paypal
			.Buttons({
				createOrder: async () => {
					const payment = await makePayment(reservation);
					return payment.id;
				},
				onApprove: async (data, actions) => {
					const order = await actions.order.capture();
					const answer = await updateReservation(reservation, {
						status: 'pending',
						paymentId: order.id,
					});
					if (answer) setToggleModal();
				},
				onError: (err) => {
					//console.log(err);
				},
			})
			.render(paypal.current);

		// eslint-disable-next-line
	}, []);

	return (
		<div className='payment'>
			<h3 className='heading-primary-subheading'>Payment:</h3>
			<Alert type='2' />
			{loggedUser.type === 'admin' && (
				<>
					<button
						className='btn'
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

			<div ref={paypal}></div>
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
