import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { clearUser, loadUsers } from '../../../actions/user';

import Alert from '../../layouts/Alert';

const ReservationsList = ({
	loadUsers,
	user: { users, loading, error },
	auth: { loggedUser },
	clearUser,
}) => {
	const [formData, setFormData] = useState({
		name: '',
		lastname: '',
		email: '',
		type: '',
	});

	const [adminValues, setAdminValues] = useState({
		showFilter: false,
	});

	const { name, lastname, email, type } = formData;

	const { showFilter } = adminValues;

	useEffect(() => {
		if (loading) loadUsers({});
	}, [loading, loadUsers]);

	const onChange = (e) => {
		setFormData((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const onSubmit = (e) => {
		e.preventDefault();
		setFormData({
			name: '',
			lastname: '',
			email: '',
			type: '',
		});
		loadUsers(formData);
	};

	return (
		<div className='list'>
			<h2 className='heading-primary'>Users</h2>

			<Alert type='1' />
			<form className='form filter' onSubmit={onSubmit}>
				<p className='filter-title'>Filter</p>
				<button
					className='filter-icon'
					onClick={(e) => {
						e.preventDefault();
						setAdminValues((prev) => ({ ...prev, showFilter: !showFilter }));
					}}
				>
					{showFilter ? (
						<i className='fas fa-chevron-up'></i>
					) : (
						<i className='fas fa-chevron-down'></i>
					)}
				</button>
				<div className={`filter-content ${!showFilter ? 'hide' : ''}`}>
					<div className='form__group'>
						<div className='form__group-sub'>
							<div className='form__group-sub-item'>
								<input
									type='text'
									className='form__input'
									placeholder='Name'
									id='name'
									onChange={onChange}
									value={name}
								/>
								<label htmlFor='name' className='form__label'>
									Name
								</label>
							</div>
							<div className='form__group-sub-item'>
								<input
									type='text'
									className='form__input'
									placeholder='Last Name'
									id='lastname'
									onChange={onChange}
									value={lastname}
								/>
								<label htmlFor='lastname' className='form__label'>
									Last Name
								</label>
							</div>
						</div>
					</div>
					<div className='form__group'>
						<input
							className='form__input'
							type='text'
							value={email}
							id='email'
							onChange={onChange}
							placeholder='Email'
						/>
						<label htmlFor='email' className='form__label'>
							Email
						</label>
					</div>
					<div className='form__group'>
						<select
							className={`form__input ${type === '' ? 'empty' : ''}`}
							id='type'
							value={type}
							onChange={onChange}
						>
							<option value=''>* Type of User</option>
							<option value='admin'>Admin</option>
							<option value='customer'>Customer</option>
						</select>
						<label
							htmlFor='type'
							className={`form__label ${type === '' ? 'hide' : ''}`}
						>
							Type of User
						</label>
					</div>

					<button type='submit' className='btn btn-tertiary'>
						<i className='fas fa-search'></i>&nbsp; Search
					</button>
				</div>
			</form>
			{!loading && (
				<>
					{users.length > 0 ? (
						<div>
							<div className='wrapper'>
								<table className='stick icon-5'>
									<thead>
										<tr>
											<th>Name</th>
											<th>Email</th>
											<th>Type</th>
											<th>Cellphone</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{users.map((user) => (
											<tr key={user.id}>
												<td>
													{user.name} {user.lastname}
												</td>
												<td>{user.email}</td>
												<td>
													{user.type.charAt(0).toUpperCase() +
														user.type.slice(1)}
												</td>
												<td>{user.cel}</td>
												<td>
													<Link
														to={
															loggedUser.id === user.id
																? '/profile'
																: `/edit-user/${user.id}`
														}
														className='btn-icon'
														onClick={() => clearUser()}
													>
														<i className='far fa-edit'></i>
													</Link>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className='list-total'>
								<span className='list-total-title text-dark'>Total:</span>
								&nbsp;
								{users.length}
							</div>
						</div>
					) : (
						<h3 className='heading-primary-subheading u-center-text text-danger'>
							{error.msg}
						</h3>
					)}
				</>
			)}
		</div>
	);
};

const mapStateToProps = (state) => ({
	user: state.user,
	auth: state.auth,
});

export default connect(mapStateToProps, {
	clearUser,
	loadUsers,
})(ReservationsList);
