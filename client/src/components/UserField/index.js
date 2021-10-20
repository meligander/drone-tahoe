import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { loadUsers, clearUsers } from '../../actions/user';

const UserField = ({
	user: { users, loading },
	selectFinalUser,
	reservationUser,
	searchDisplay,
	switchDisplay,
	clearUsers,
	loadUsers,
	clear,
	completeClear,
	autoComplete,
}) => {
	const initialValue = {
		email: '',
		lockEmail: false,
	};

	const [adminValues, setAdminValues] = useState(initialValue);

	const { email, lockEmail } = adminValues;

	useEffect(() => {
		if (reservationUser) {
			if (reservationUser.email)
				setAdminValues((prev) => ({ ...prev, email: reservationUser.email }));
		} else setAdminValues((prev) => ({ ...prev, email: '' }));
	}, [reservationUser]);

	useEffect(() => {
		if (clear) {
			setAdminValues({
				email: '',
				lockEmail: false,
			});
			completeClear();
		}
	}, [clear, completeClear]);

	const selectUser = (user) => {
		setAdminValues((prev) => ({
			...prev,
			email: user.email,
			lockEmail: true,
		}));
		selectFinalUser(user);
		clearUsers();
	};

	const cancelUser = () => {
		selectFinalUser();
		setAdminValues(initialValue);
	};

	return (
		<div className='form__group form-search'>
			<input
				className='form__input'
				type='text'
				value={email}
				disabled={reservationUser || lockEmail}
				name='email'
				id='email'
				autoComplete={autoComplete}
				onFocus={() => switchDisplay(true)}
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
					<i className='far fa-times-circle'></i>
				</button>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	user: state.user,
});

export default connect(mapStateToProps, { loadUsers, clearUsers })(UserField);
