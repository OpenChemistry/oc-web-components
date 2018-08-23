import React, { Component } from 'react';

import { connect } from 'react-redux';

import UserMenu from '../../components/user-menu';

import { getAuthState } from '../../utils';
import { invalidateToken, getMe } from '@openchemistry/girder-auth-redux';

class UserMenuContainer extends Component {
  
  onSignOutClick = () => {
    this.props.dispatch(invalidateToken());
  }

  render() {
    return (
      <UserMenu
        me={this.props.me}
        handleSignOut={this.onSignOutClick}
      />
    );
  }
}

function mapStateToProps(state) {
  const me = getMe(getAuthState(state));
  return {
    me
  }
}

export default connect(mapStateToProps)(UserMenuContainer);
