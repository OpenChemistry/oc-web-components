import React, { Component } from 'react';

import { connect } from 'react-redux';

import UserMenu from '../../components/user-menu';

import { auth } from '@openchemistry/girder-redux';

class UserMenuContainer extends Component {
  
  onSignOutClick = () => {
    this.props.dispatch(auth.actions.invalidateToken());
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
  const me = auth.selectors.getMe(state);
  return {
    me
  }
}

export default connect(mapStateToProps)(UserMenuContainer);
