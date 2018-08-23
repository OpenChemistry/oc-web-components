import React, { Component } from 'react';

import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';

import { getAuthState } from '../../utils';
import GirderLogin from '../../components/girder-login';

import {
  showGirderLogin,
  usernameLogin,
  getShowGirderLogin
} from '@openchemistry/girder-auth-redux';

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
    this.props.dispatch(showGirderLogin(false));
  };

  handleLogin = (values, dispatch) => {

    const { username, password } = values;
  
    let onSubmitPromise = new Promise((resolve, reject) => {
      dispatch(usernameLogin({username, password, resolve, reject}));
    })
    .then(val => {
      dispatch(showGirderLogin(false));
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
      <GirderLogin
        handleClose={this.handleClose}
        loginFn={this.handleLogin}
        {...this.props}
      />
    );
  }
}

function girderLoginMapStateToProps(state, ownProps) {
  const show = getShowGirderLogin(getAuthState(state));
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
