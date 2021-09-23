import React, { useState } from 'react';

import logo from '../../../img/logoDRONE-dark-cropped-final.png';
import ReservationForm from '../../ReservationForm';

import './PopUp.scss';

const PopUp = ({
	toggleModal,
	setToggleModal,
	confirm,
	text,
	subtext,
	type,
	reservation,
}) => {
	const [instanceKey, setInstanceKey] = useState(0);
	const handleReset = () => setInstanceKey((i) => i + 1);

	const selectType = () => {
		switch (type) {
			case 'confirmation':
				return (
					<div className='popup-text'>
						<p>{text}</p>
						{subtext ? <p>{subtext}</p> : ''}
					</div>
				);
			case 'schedule':
				return (
					<div className='popup-schedule wrapper wrapper-popup'>
						<ReservationForm
							reservation={reservation}
							complete={setToggleModal}
							key={instanceKey}
						/>
					</div>
				);
			case 'job':
				return <div></div>;
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
							if (type === 'schedule') handleReset();
						}}
						className='popup-heading-btn'
					>
						<i className='fas fa-times'></i>
					</button>
				</div>
				{selectType()}
				{type === 'confirm' && (
					<div className='popup-btns'>
						<button
							type='button'
							className='btn btn-success'
							onClick={(e) => {
								e.preventDefault();
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
				)}
			</div>
		</div>
	);
};

export default PopUp;
