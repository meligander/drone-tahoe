import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { loadUsers, clearUsers } from '../../actions/user';

const UserField = ({
	user: { users, loading },
	selectFinalUser,
	reservationUser,
	clearUsers,
	loadUsers,
}) => {
	const [adminValues, setAdminValues] = useState({
		email: '',
		searchDisplay: false,
	});
	useEffect(() => {
		if (reservationUser) {
			if (reservationUser.email)
				setAdminValues((prev) => ({ ...prev, email: reservationUser.email }));
		} else setAdminValues((prev) => ({ ...prev, email: '' }));
	}, [reservationUser]);

	const { email, searchDisplay } = adminValues;

	const selectUser = (user) => {
		setAdminValues((prev) => ({
			...prev,
			email: user.email,
			searchDisplay: false,
		}));
		selectFinalUser(user);
		clearUsers();
	};

	const cancelUser = () => {
		selectFinalUser();
		setAdminValues((prev) => ({
			...prev,
			email: '',
			searchDisplay: false,
		}));
	};

	return (
		<div className='form__group form-search'>
			<input
				className='form__input'
				type='text'
				value={email}
				disabled={reservationUser}
				name='email'
				id='email'
				autoComplete='off'
				onFocus={() =>
					setAdminValues((prev) => ({
						...prev,
						searchDisplay: true,
					}))
				}
				onChange={(e) => {
					setAdminValues((prev) => ({
						...prev,
						email: e.target.value,
					}));
					if (e.target.value.length > 1) {
						clearUsers();
						loadUsers(
							{
								type: 'customer',
								email: e.target.value,
							},
							true
						);
					}
				}}
				placeholder="User's Email"
			/>
			<label htmlFor='email' className='form__label'>
				User's Email
			</label>
			{searchDisplay && email.length > 1 && !reservationUser && (
				<ul
					className={`form-search-display ${
						users.length === 0 ? 'danger' : ''
					}`}
				>
					{!loading && (
						<>
							{users.length > 0 ? (
								users.map((user) => (
									<li
										className='form-search-item'
										onClick={() => selectUser(user)}
										key={user.id}
									>
										{user.email}
									</li>
								))
							) : (
								<li className='bg-danger form-search-item'>
									No matching results
								</li>
							)}
						</>
					)}
				</ul>
			)}
			{email.length > 1 && !reservationUser && (
				<button
					type='button'
					onClick={cancelUser}
					className='form-search-close'
				>
					<i className='fas fa-times'></i>
				</button>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	user: state.user,
});

export default connect(mapStateToProps, { loadUsers, clearUsers })(UserField);
