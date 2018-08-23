import React, { Component } from 'react';

import { has } from 'lodash-es';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core';

import red from '@material-ui/core/colors/red';

import InputIcon from '@material-ui/icons/Input';
import ClearIcon from '@material-ui/icons/Clear';

import {
  TextField
} from 'redux-form-material-ui';
import { Field } from 'redux-form'

const red500 = red['500'];

const style = {
  error: {
    color: red500
  }
}

class GirderLogin extends Component {

  render = () => {
    const {
      // redux-form
      error,
      handleSubmit,
      pristine,
      submitting,
      invalid,
      // other props
      show,
      handleClose,
      loginFn
    } = this.props;

    return (
      <Dialog
        aria-labelledby="girder-dialog-title"
        open={show}
        onClose={handleClose}
      >
        <DialogTitle id="girder-dialog-title">Sign in using Girder credentials</DialogTitle>
        <form onSubmit={handleSubmit(loginFn)} >
          <DialogContent>
            <div>
              <Field
                fullWidth
                name="username"
                component={TextField}
                placeholder="Username"
                label="Username"
              />
            </div>
            <div>
              <Field
                fullWidth
                name="password"
                component={TextField}
                placeholder="Password"
                label="Password"
                type="password"
              />
            </div>
            {error && <div style={style.error}>{has(error, 'message') ? error.message : error}</div>}
          </DialogContent>
          <DialogActions>
            <Button
              disabled={pristine || submitting || invalid}
              variant="contained"
              color="secondary"
              type='submit'
            >
              <InputIcon className="l-icon-btn" />
              Login
            </Button>
            <Button
              disabled={submitting}
              variant="contained"
              color="secondary"
              onClick={() => handleClose()}
            >
              <ClearIcon className="l-icon-btn" />
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default GirderLogin;
