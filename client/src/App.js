import React, { useEffect, useState } from 'react';
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
import Routes from './components/routing/Routes';

const App = () => {
	const [adminValues, setAdminValues] = useState({
		navbar: 0,
		footer: 0,
	});

	const { navbar, footer } = adminValues;

	useEffect(() => {
		if (localStorage.token) {
			setAuthToken(localStorage.token);
			store.dispatch(loadUser());
		}
	}, []);
	return (
		<Provider store={store}>
			<Router history={history}>
				<Navbar
					navbarHeight={(height) =>
						setAdminValues((prev) => ({ ...prev, navbar: height }))
					}
				/>
				<div
					style={{
						/* minHeight: `calc(100vh - ${footer}px)`, */
						paddingTop: `${navbar}px`,
					}}
				>
					<Switch>
						<Route path='/' exact component={Home} />
						<Route path='/portfolio' exact component={Portfolio} />
						<Route path='/contact' exact component={Contact} />
						<Route path='/servicesfull' exact component={ServicesFull} />
						<Route path='/vrm' component={VRM} />
						<Route path='/booking' component={Booking} />
						<Route path='/login' component={Login} />
						<Routes navbar={navbar} footer={footer} />
					</Switch>
				</div>
				<Footer
					footerHeight={(height) =>
						setAdminValues((prev) => ({ ...prev, footer: height }))
					}
				/>
			</Router>
		</Provider>
	);
};

export default App;
