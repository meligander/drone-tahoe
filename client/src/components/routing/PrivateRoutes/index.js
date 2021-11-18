import React, { Fragment } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Loading from '../../layouts/Loading';

const PrivateRoutes = ({
	component: Component,
	auth: { loggedUser, loading, token },
	types,
	path,
}) => {
	if (!loading && token) {
		if (types.length === 0 || types.some((item) => item === loggedUser.type)) {
			return (
				<Fragment>
					<Loading />
					<Route exact path={path} component={Component} />
				</Fragment>
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
