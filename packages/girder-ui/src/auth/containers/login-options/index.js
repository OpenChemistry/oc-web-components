import React, { Component } from 'react';

import { connect } from 'react-redux';

import LoginOptions from '../../components/login-options';

import { auth } from '@openchemistry/girder-redux';

class LoginOptionsContainer extends Component {

  handleClose = () => {
    this.props.dispatch(auth.actions.showLoginOptions(false));
  };

  handleGoogle = () => {
    this.props.dispatch(auth.actions.showLoginOptions(false));
    this.props.dispatch(auth.actions.authenticate({token: null, redirect: true}));
  }

  handleGirder = () => {
    this.props.dispatch(auth.actions.showLoginOptions(false));
    this.props.dispatch(auth.actions.showGirderLogin(true));
  }

  render() {
    const { show } = this.props;
    
    if (!show) {
      return null;
    }

    return (
      <LoginOptions
        {...this.props}
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
  const show = auth.selectors.getShowLoginOptions(state);
  const oauth =  auth.selectors.isOauthEnabled(state);

  return {
    show,
    oauth,
  }
}

LoginOptionsContainer = connect(loginOptionsMapStateToProps)(LoginOptionsContainer)

export default LoginOptionsContainer;
