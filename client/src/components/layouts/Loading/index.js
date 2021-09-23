import React from 'react';
import { connect } from 'react-redux';

import spinner from '../../../img/spinner.gif';

const Loading = ({ global: { loadingSpinner } }) => {
	return (
		<>
			{loadingSpinner && (
				<div className='blurr-bg' style={{ zIndex: 1000 }}>
					<img
						src={spinner}
						style={{
							width: '300px',
							display: 'flex',
							margin: '0 auto',
						}}
						alt=''
					/>
				</div>
			)}
		</>
	);
};

const mapStateToProps = (state) => ({
	global: state.global,
});

export default connect(mapStateToProps)(Loading);
