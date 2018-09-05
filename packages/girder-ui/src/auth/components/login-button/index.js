import React, { Component } from 'react';

import { Button } from '@material-ui/core';
import InputIcon from '@material-ui/icons/Input';

class LoginButton extends Component {
  render = () => {
    return (
      <Button onClick={this.props.handleClick}>
        Log in
        <InputIcon className="r-icon-btn" />
      </Button>
    );
  }
}

export default LoginButton;
