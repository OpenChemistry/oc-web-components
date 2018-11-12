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

class NerscLoginContainer extends Component {

  handleClose = () => {
    this.props.dispatch(auth.actions.showNerscLogin(false));
  };

  handleLogin = (values, dispatch) => {

    const { username, password, mfa } = values;
  
    let onSubmitPromise = new Promise((resolve, reject) => {
      dispatch(auth.actions.nerscLogin({username, password, mfa, resolve, reject}));
    })
    .then(val => {
      dispatch(auth.actions.showNerscLogin(false));
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
        title='Sign in using NERSC credentials'
        showMfa
        {...this.props}
      />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const show = auth.selectors.getShowNerscLogin(state);
  return {
    show
  }
}

NerscLoginContainer = connect(mapStateToProps)(NerscLoginContainer)
NerscLoginContainer = reduxForm({
  form: 'nerscLogin',
  validate
})(NerscLoginContainer);

export default NerscLoginContainer;
