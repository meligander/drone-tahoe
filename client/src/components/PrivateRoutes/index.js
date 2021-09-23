import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Loading from '../layouts/Loading';

const PrivateRoutes = ({
	component: Component,
	auth: { loggedUser, loading, token },
	types,
	path,
}) => {
	if (!loading && token) {
		let pass = false;
		if (types.length === 0) {
			pass = true;
		} else {
			for (let x = 0; x < types.length; x++) {
				if (types[x] === loggedUser.type) {
					pass = true;
					break;
				}
			}
		}

		if (pass) {
			return (
				<>
					<Loading />
					<Route exact path={path} component={Component} />
				</>
			);
		} else {
			return <Redirect to='/' />;
		}
	} else {
		if (token === null) {
			return <Redirect to='/login' />;
		} else {
			return <Loading />;
		}
	}
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoutes);
