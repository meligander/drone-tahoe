import React, { useRef, useEffect } from 'react';
import { connect } from 'react-redux';

import { registerReservation, makePayment } from '../../actions/reservation';
import { setAlert } from '../../actions/alert';

const PayPal = ({
	reservation,
	registerReservation,
	complete,
	makePayment,
	setAlert,
}) => {
	const paypal = useRef();

	useEffect(() => {
		window.paypal
			.Buttons({
				createOrder: async () => {
					console.log(reservation.user);
					if (reservation.user) {
						const payment = await makePayment(reservation);
						return payment.id;
					} else setAlert("User's email is required", 'danger', '2');
				},
				onApprove: async (data, actions) => {
					const order = await actions.order.capture();
					registerReservation({ ...reservation, paymentId: order.id });
					complete();
				},
				onError: (err) => {
					//console.log(err);
				},
			})
			.render(paypal.current);
	}, [complete, makePayment, reservation, registerReservation, setAlert]);

	return (
		<div>
			<div ref={paypal}></div>
		</div>
	);
};

export default connect(null, { registerReservation, makePayment, setAlert })(
	PayPal
);
