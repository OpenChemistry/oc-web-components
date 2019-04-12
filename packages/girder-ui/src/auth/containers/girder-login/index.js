import React, { Component } from 'react';

import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';

import UsernameLogin from '../../components/username-login';

import { auth } from '@openchemistry/girder-redux';

const validate = values => {
  const errors = {};
  const requiredFields = [ 'username', 'password'];
  requiredFields.forEach(field => {
    if (!values[ field ]) {
      errors[ field ] = 'Required'
    }
  });

  return errors;
}

class GirderLoginContainer extends Component {

  handleClose = () => {
    this.props.dispatch(auth.actions.showGirderLogin(false));
  };

  handleLogin = (values, dispatch) => {

    const { username, password } = values;
    const { reset } = this.props;

    let onSubmitPromise = new Promise((resolve, reject) => {
      dispatch(auth.actions.usernameLogin({username, password, resolve, reject}));
    })
    .then(_val => {
      dispatch(auth.actions.showGirderLogin(false));
      reset();
    })
    .catch(_error => {
      throw new SubmissionError({ _error });
    });

    return onSubmitPromise;
  }

  render = () => {
    const { show } = this.props;
    
    if (!show) {
      return null;
    }

    return (
      <UsernameLogin
        handleClose={this.handleClose}
        loginFn={this.handleLogin}
        title='Sign in using Girder credentials'
        {...this.props}
      />
    );
  }
}

function girderLoginMapStateToProps(state, ownProps) {
  const show = auth.selectors.getShowGirderLogin(state);
  return {
    show
  }
}

GirderLoginContainer = connect(girderLoginMapStateToProps)(GirderLoginContainer)
GirderLoginContainer = reduxForm({
  form: 'girderLogin',
  validate
})(GirderLoginContainer);

export default GirderLoginContainer;
