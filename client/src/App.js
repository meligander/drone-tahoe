import React, { useEffect } from 'react';
import { Router, Switch, Route } from 'react-router-dom';
import './sass/main.scss';

//Redux
import store from './store';
import { Provider } from 'react-redux';
import setAuthToken from './utils/setAuthToken';
import history from './utils/history';

import { loadUser } from './actions/auth';

import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';
import Home from './components/pages/Home';
import Contact from './components/pages/Contact';
import ServicesFull from './components/pages/ServicesFull';
import VRM from './components/pages/VRM';
import Portfolio from './components/pages/Portfolio';
import Booking from './components/pages/Booking';
import Login from './components/pages/Login';
import EditUser from './components/pages/EditUser';
import Activation from './components/pages/Activation';
import ChangePassword from './components/pages/ChangePassword';
import Reservation from './components/pages/Reservation';
//import Dashboard from './components/pages/Dashboard';

import PrivateRoutes from './components/PrivateRoutes';
import ReservationsList from './components/pages/ReservationsList';

const App = () => {
	useEffect(() => {
		if (localStorage.token) {
			setAuthToken(localStorage.token);
			store.dispatch(loadUser());
		}
	}, []);
	return (
		<Provider store={store}>
			<Router history={history}>
				<Navbar />
				<Switch>
					<Route path='/' exact component={Home} />
					<Route path='/portfolio' exact component={Portfolio} />
					<Route path='/contact' exact component={Contact} />
					<Route path='/servicesfull' exact component={ServicesFull} />
					<Route path='/vrm' component={VRM} />
					<Route path='/booking' component={Booking} />
					<Route path='/login' component={Login} />
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
					{/* <PrivateRoutes
						exact
						path='/dashboard'
						component={Dashboard}
						types={['admin']}
					/> */}
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
				</Switch>
				<Footer />
			</Router>
		</Provider>
	);
};

export default App;
