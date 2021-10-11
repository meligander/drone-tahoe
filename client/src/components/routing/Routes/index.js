import React from 'react';
import { Switch, Route } from 'react-router-dom';

import EditUser from '../../pages/EditUser';
import Activation from '../../pages/Activation';
import ChangePassword from '../../pages/ChangePassword';
import Reservation from '../../pages/Reservation';

import PrivateRoutes from '../PrivateRoutes';
import ReservationsList from '../../pages/ReservationsList';
import JobsList from '../../pages/JobsList';
import ManageSchedule from '../../pages/ManageSchedule';
import UsersList from '../../pages/UsersList';

const Routes = ({ footer, navbar }) => {
	return (
		<div
			className='container'
			style={{
				minHeight: `calc(100vh - ${footer}px - ${navbar}px)`,
			}}
		>
			<Switch>
				<Route path='/signup' component={EditUser} />
				<Route path='/activation/:token' component={Activation} />
				<Route path='/resetpassword/:token' component={ChangePassword} />
				<Route path='/reservation/:job_id' component={Reservation} />
				<PrivateRoutes
					exact
					path='/profile'
					component={EditUser}
					types={['admin', 'customer']}
				/>
				<PrivateRoutes
					exact
					path='/edit-user/:user_id'
					component={EditUser}
					types={['admin']}
				/>
				<PrivateRoutes
					exact
					path='/reservations-list'
					component={ReservationsList}
					types={['admin']}
				/>
				<PrivateRoutes
					exact
					path='/jobs-list'
					component={JobsList}
					types={['admin']}
				/>
				<PrivateRoutes
					exact
					path='/schedule'
					component={ManageSchedule}
					types={['admin']}
				/>
				<PrivateRoutes
					exact
					path='/users-list'
					component={UsersList}
					types={['admin']}
				/>
			</Switch>
		</div>
	);
};

export default Routes;
