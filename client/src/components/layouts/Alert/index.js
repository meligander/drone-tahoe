import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import './Alert.scss';

const Alert = ({ alerts, type, classType }) =>
	alerts !== null &&
	alerts.map((alert) => (
		<React.Fragment key={alert.id}>
			{alert.type === type && (
				<div className={`alert alert-${alert.alertType} ${classType}`}>
					{alert.msg}
				</div>
			)}
		</React.Fragment>
	));

Alert.propTypes = {
	alerts: PropTypes.array.isRequired,
	type: PropTypes.string,
};

const mapStateToProps = (state) => ({
	alerts: state.alert,
});

export default connect(mapStateToProps)(Alert);
