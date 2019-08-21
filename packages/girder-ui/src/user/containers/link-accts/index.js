import React, { Component } from 'react';
import { connect } from 'react-redux';

import AccountsDialog from '../../components/link-accts';

import { user } from '@openchemistry/girder-redux';


class AccountsDialogContainer extends Component {

  onSubmit = (userId, mediaId, title) => {
    if (title == 'Twitter') {
      this.props.dispatch(
        user.actions.linkToTwitter({userId, mediaId}));
    } else {
      this.props.dispatch(
        user.actions.linkToOrcid({userId, mediaId}));
    }
  }

  render() {
    return (
      <AccountsDialog
        onSubmit={this.onSubmit}
        {...this.props}
      />
    );
  }
}

function MapStateToProps(state) {
  const userInfo = user.selectors.getUserData(state);

  return {
    userInfo
  }
}

AccountsDialogContainer = connect(MapStateToProps)(AccountsDialogContainer)

export default AccountsDialogContainer;