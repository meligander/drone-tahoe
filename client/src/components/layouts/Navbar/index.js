import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { logOut } from '../../../actions/auth';
import { clearReservations } from '../../../actions/reservation';
import { clearJobsXReservations } from '../../../actions/jobsXReservations';
import { clearJobs } from '../../../actions/jobs';
import { clearUsers } from '../../../actions/user';
import { setNavbarHeight } from '../../../actions/global';

import './Navbar.scss';

const Navbar = ({
	logOut,
	clearReservations,
	clearJobs,
	clearUsers,
	clearJobsXReservations,
	setNavbarHeight,
	auth: { loggedUser, loading },
}) => {
	const [click, setClick] = useState(false);
	const [button, setButton] = useState(true);

	const handleClick = () => setClick(!click);
	const closeMobileMenu = () => setClick(false);

	const ref = useRef();

	useEffect(() => {
		showButton();
		setTimeout(() => {
			setNavbarHeight(ref.current.offsetHeight);
		}, 30);
	}, [setNavbarHeight]);

	const showButton = () => {
		setButton(window.innerWidth > 960);
	};

	window.addEventListener('resize', showButton);

	return (
		<nav
			ref={ref}
			className='navbar'
			style={{
				justifyContent: button ? 'space-between' : 'flex-end',
				padding: button ? '1.8rem 0.5rem' : '1rem 1.2rem',
			}}
			id='top'
		>
			<div className='navbar-container'>
				<div className='menu-icon' onClick={handleClick}>
					<i className={click ? 'fas fa-times' : 'fas fa-bars'}></i>
				</div>

				<ul className={click ? 'nav-menu active' : 'nav-menu'}>
					<li className='nav-item'>
						<Link
							to='/'
							className='nav-links'
							onClick={() => {
								closeMobileMenu();
								window.scrollTo(0, 0);
							}}
						>
							Home
						</Link>
					</li>
					{!loading && loggedUser && (
						<li className='nav-links-salute'>
							<Link
								to='/profile'
								onClick={() => {
									closeMobileMenu();
									clearUsers();
									window.scrollTo(0, 0);
								}}
								className='btn-link'
							>
								<i className='fas fa-user-alt'></i> Hi {loggedUser.name}!
							</Link>
						</li>
					)}
					{!loading && loggedUser && loggedUser.type === 'admin' ? (
						<>
							<li className='nav-item'>
								<Link
									to='/reservations-list'
									className='nav-links'
									onClick={() => {
										closeMobileMenu();
										clearReservations();
										clearJobs();
										clearJobsXReservations();
										window.scrollTo(0, 0);
									}}
								>
									Reservations
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									to='/schedule'
									className='nav-links'
									onClick={() => {
										closeMobileMenu();
										clearReservations();
										window.scrollTo(0, 0);
									}}
								>
									Schedule
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									to='/users-list'
									className='nav-links'
									onClick={() => {
										closeMobileMenu();
										clearUsers();
										window.scrollTo(0, 0);
									}}
								>
									Users
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									to='/jobs-list'
									className='nav-links'
									onClick={() => {
										closeMobileMenu();
										clearJobs();
										window.scrollTo(0, 0);
									}}
								>
									Jobs
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									to='/promotions'
									className='nav-links'
									onClick={() => {
										closeMobileMenu();
										clearJobs();
										clearJobsXReservations();
										window.scrollTo(0, 0);
									}}
								>
									Promotions
								</Link>
							</li>
						</>
					) : (
						<>
							<li className='nav-item'>
								<Link
									to='/servicesfull'
									className='nav-links'
									onClick={() => {
										closeMobileMenu();
										clearJobs();
										window.scrollTo(0, 0);
									}}
								>
									Services
								</Link>
							</li>
							<li
								className='nav-item'
								style={!loading && loggedUser ? { order: 5 } : null}
							>
								<Link
									to='/portfolio'
									className='nav-links'
									onClick={() => {
										closeMobileMenu();
										window.scrollTo(0, 0);
									}}
								>
									Portfolio
								</Link>
							</li>
							<li
								className='nav-item'
								style={!loading && loggedUser ? { order: 4 } : null}
							>
								<Link
									to={!loading && loggedUser ? '/reservation/0' : '/contact'}
									className='nav-links'
									onClick={() => {
										closeMobileMenu();
										window.scrollTo(0, 0);
										if (!loading && loggedUser) {
											clearReservations();
											clearJobs();
										}
									}}
								>
									{!loading && loggedUser ? 'Reservations' : 'Contact'}
								</Link>
							</li>
						</>
					)}

					<li
						className='nav-item'
						style={!loading && loggedUser ? { order: 6 } : null}
					>
						<Link
							to={!loading && loggedUser ? '/' : '/login'}
							onClick={() => {
								if (!loading && loggedUser) logOut();
								closeMobileMenu();
								window.scrollTo(0, 0);
							}}
							className='nav-links-mobile btn btn-outline'
						>
							{!loading && loggedUser ? 'Log Out' : 'Log In'}
						</Link>
					</li>
				</ul>
			</div>
			{!loading && loggedUser && (
				<div className='nav-salute'>
					<Link
						to='/profile'
						onClick={() => {
							window.scrollTo(0, 0);
							clearUsers();
						}}
						className='btn-link'
					>
						Hi {loggedUser.name}!
					</Link>
				</div>
			)}

			{button && (
				<div className='nav-button'>
					<Link
						to={!loading && loggedUser ? '/' : '/login'}
						onClick={() => {
							if (!loading && loggedUser) logOut();
							window.scrollTo(0, 0);
						}}
						className='btn btn-outline'
					>
						{!loading && loggedUser ? 'Log Out' : 'Log In'}
					</Link>
				</div>
			)}
		</nav>
	);
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, {
	logOut,
	clearReservations,
	clearJobs,
	clearUsers,
	setNavbarHeight,
	clearJobsXReservations,
})(Navbar);
