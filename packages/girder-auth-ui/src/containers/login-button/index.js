import React, { Component } from 'react';

import { connect } from 'react-redux';

import LoginButton from '../../components/login-button';

import {
  showLoginOptions
} from '@openchemistry/girder-auth-redux';

// Login Button

class LoginButtonContainer extends Component {
  handleClick = (event) => {
    this.props.dispatch(showLoginOptions(true));
  };

  render = () => {
    return (
        <LoginButton handleClick={this.handleClick} />
    );
  }
}

function loginButtonMapStateToProps(state, ownProps) {
  return {};
}

LoginButtonContainer = connect(loginButtonMapStateToProps)(LoginButtonContainer)

export default LoginButtonContainer;
