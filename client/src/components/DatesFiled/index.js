import React from 'react';

const DatesFiled = ({ onChange, onFocus, hourFrom, hourTo }) => {
	return (
		<div className='form__group'>
			<div className='form__group-sub'>
				<div className='form__group-sub-item'>
					<input
						type='date'
						className='form__input'
						placeholder='YYYY/MM/DD'
						id='hourFrom'
						value={hourFrom}
						onChange={onChange}
						onFocus={onFocus}
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
						placeholder='YYYY/MM/DD'
						min={hourFrom !== '' ? hourFrom : null}
						onFocus={onFocus}
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
