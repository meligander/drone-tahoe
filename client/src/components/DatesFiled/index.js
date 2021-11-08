import React from 'react';

const DatesFiled = ({ onChange, onFocus, hourFrom, hourTo }) => {
	return (
		<div className='form__group'>
			<div className='form__group-sub'>
				<div className='form__group-sub-item'>
					<input
						type='date'
						className='form__input'
						id='hourFrom'
						value={hourFrom}
						onChange={onChange}
					/>
					<label htmlFor='hourFrom' className='form__label'>
						From
					</label>
				</div>
				<div className='form__group-sub-item'>
					<input
						type='date'
						className='form__input'
						id='hourTo'
						min={hourFrom !== '' ? hourFrom : null}
						onChange={onChange}
						value={hourTo}
					/>
					<label htmlFor='hourTo' className='form__label'>
						To
					</label>
				</div>
			</div>
		</div>
	);
};

export default DatesFiled;
