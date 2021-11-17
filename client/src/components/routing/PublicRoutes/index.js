import React, {Fragment} from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Loading from '../../layouts/Loading';

const PublicRoutes = ({
	component: Component,
	auth: { isAuthenticated, userLogged },
	path,
}) => {
	if (isAuthenticated) {
		return (
			<Redirect
				to={
					userLogged && userLogged.type === 'customer'
						? '/'
						: '/reservations-list'
				}
			/>
		);
	} else
		return (
			<Fragment>
				<Loading />
				<Route exact path={path} component={Component} />
			</ Fragment>
		);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps)(PublicRoutes);
