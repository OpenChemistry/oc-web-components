import React, { Component } from 'react';
import { connect } from 'react-redux';
import BasicInfoForm from '../../components/basic-info';

import { user } from '@openchemistry/girder-redux';


class BasicInfo extends Component {

  componentDidMount() {
    this.props.dispatch(user.actions.fetchUserData());
  }

  onSubmit = (id, values) => {
    this.props.dispatch(
      user.actions.updateUserInformation({id, values}));
  }

  render() {
    return (
      <BasicInfoForm
        onSubmit={this.onSubmit}
        {...this.props}
      />
    );
  }
}

function MapStateToProps(state) {
  const userInfo = user.selectors.getUserData(state);
  const twitterId = user.selectors.getTwitterId(state);
  const orcidId = user.selectors.getOrcidId(state);

  return {
    userInfo,
    twitterId,
    orcidId
  };
}

BasicInfo = connect(MapStateToProps)(BasicInfo)

export default BasicInfo;