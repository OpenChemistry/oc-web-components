import React, { Component } from 'react';

import { connect } from 'react-redux';

import { getAuthState } from '../../utils';
import LoginOptions from '../../components/login-options';

import {
  showLoginOptions,
  showGirderLogin,
  authenticate,
  isOauthEnabled,
  getShowLoginOptions
} from '@openchemistry/girder-auth-redux';

class LoginOptionsContainer extends Component {

  handleClose = () => {
    this.props.dispatch(showLoginOptions(false));
  };

  handleGoogle = () => {
    this.props.dispatch(showLoginOptions(false));
    this.props.dispatch(authenticate({token: null, redirect: true}));
  }

  handleGirder = () => {
    this.props.dispatch(showLoginOptions(false));
    this.props.dispatch(showGirderLogin(true));
  }

  render() {
    const { show } = this.props;
    
    if (!show) {
      return null;
    }

    return (
      <LoginOptions
        show={this.props.show}
        oauth={this.props.oauth}
        handleClose={this.handleClose}
        handleGoogle={this.handleGoogle}
        handleGirder={this.handleGirder}
      />
    );
  }
}

function loginOptionsMapStateToProps(state, ownProps) {
  const show = getShowLoginOptions(getAuthState(state));
  const oauth =  isOauthEnabled(getAuthState(state));

  return {
    show,
    oauth,
  }
}

LoginOptionsContainer = connect(loginOptionsMapStateToProps)(LoginOptionsContainer)

export default LoginOptionsContainer;
