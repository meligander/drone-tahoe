import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';

import PrivateRoutes from '../PrivateRoutes';
import PublicRoutes from '../PublicRoutes';

import EditUser from '../../pages/EditUser';
import Activation from '../../pages/Activation';
import ChangePassword from '../../pages/ChangePassword';
import Reservation from '../../pages/Reservation';
import ReservationsList from '../../pages/ReservationsList';
import JobsList from '../../pages/JobsList';
import ManageSchedule from '../../pages/ManageSchedule';
import UsersList from '../../pages/UsersList';
import Outreach from '../../pages/Outreach';

const Routes = ({ global: { navbar, footer } }) => {
	return (
		<div
			className='container'
			style={{
				minHeight: `calc(100vh - ${footer}px - ${navbar}px)`,
			}}
		>
			<Switch>
				<PublicRoutes path='/signup' component={EditUser} />
				<PublicRoutes path='/resetpassword/:token' component={ChangePassword} />
				<Route exact path='/reservation/:job_id' component={Reservation} />
				<Route
					path='/activation/:token'
					component={Activation}
					types={['admin', 'customer']}
				/>
				<PrivateRoutes
					path='/profile'
					component={EditUser}
					types={['admin', 'customer']}
				/>
				<PrivateRoutes
					path='/edit-user/:user_id'
					component={EditUser}
					types={['admin']}
				/>
				<PrivateRoutes
					path='/reservations-list'
					component={ReservationsList}
					types={['admin']}
				/>
				<PrivateRoutes
					path='/jobs-list'
					component={JobsList}
					types={['admin']}
				/>
				<PrivateRoutes
					path='/schedule'
					component={ManageSchedule}
					types={['admin']}
				/>
				<PrivateRoutes
					path='/users-list'
					component={UsersList}
					types={['admin']}
				/>
				<PrivateRoutes
					path='/outreach'
					component={Outreach}
					types={['admin']}
				/>
			</Switch>
		</div>
	);
};

const mapStateToProps = (state) => ({
	global: state.global,
});

export default connect(mapStateToProps)(Routes);
