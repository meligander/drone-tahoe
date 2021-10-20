import React from 'react';

import logo from '../../../img/logoDRONE-dark-cropped-final.png';
import HourRangeForm from '../../HourRangeForm';
import JobForm from '../../JobForm';
import ReservationForm from '../../ReservationForm';
import PayPal from '../../PayPal';

import './PopUp.scss';

const PopUp = ({
	toggleModal,
	setToggleModal,
	confirm,
	text,
	subtext,
	type,
	toUpdate,
}) => {
	const selectType = () => {
		switch (type) {
			case 'confirmation':
				return (
					<div className='popup-text'>
						<p>{text}</p>
						{subtext ? <p>{subtext}</p> : ''}
						<div className='popup-btns'>
							<button
								className='btn btn-success'
								onClick={() => {
									confirm();
									setToggleModal();
								}}
							>
								OK
							</button>
							<button
								type='button'
								className='btn btn-danger'
								onClick={setToggleModal}
							>
								Cancel
							</button>
						</div>
					</div>
				);
			case 'schedule':
				return (
					<div className='popup-schedule wrapper wrapper-popup'>
						<ReservationForm
							reservation={toUpdate}
							setToggleModal={setToggleModal}
						/>
					</div>
				);
			case 'job':
				return (
					<div className='popup-job wrapper wrapper-popup'>
						<JobForm
							toggleModal={toggleModal}
							confirm={confirm}
							job={toUpdate}
							setToggleModal={setToggleModal}
						/>
					</div>
				);
			case 'hour':
				return (
					<div className='popup-hour wrapper wrapper-popup'>
						<HourRangeForm setToggleModal={setToggleModal} confirm={confirm} />
					</div>
				);
			case 'payment':
				return (
					<div className='popup-payment'>
						<PayPal reservation={toUpdate} setToggleModal={setToggleModal} />
					</div>
				);
			default:
				break;
		}
	};

	return (
		<div className={`blurr-bg popup ${!toggleModal ? 'hide' : ''}`}>
			<div className={`popup-content ${type}`}>
				<div className='popup-heading'>
					<img className='popup-heading-img' src={logo} alt='logo' />
					<button
						type='button'
						onClick={() => {
							setToggleModal();
						}}
						className='popup-heading-btn'
					>
						<i className='fas fa-times'></i>
					</button>
				</div>
				{selectType()}
			</div>
		</div>
	);
};

export default PopUp;
