import React, { Component } from 'react';

import { TextField, Button } from '@material-ui/core';

class AddUser extends Component {
  render() {
    const {showSearch} = this.props;
    if(!showSearch) {
      return null;
    } else {
      return(
        <div style={{ margin: 'auto', display: 'table', padding: '5px' }}>
          <form noValidate autoComplete="off">
          <TextField
            label = 'Add User'
            value = {this.props.value}
            onChange = {(e) => { this.props.handleChange(e) }}
            margin = "normal"
            variant = "outlined"
            onKeyPress={(e) => { this.props.handleKeyPress(e) }}
          />
          </form>
          <Button style={{ margin:'auto', display:'block'}}
            variant="contained"
            onClick={(e) => {this.props.handleSubmit(e)}}>
              Submit
          </Button>
        </div>
      );
    }
  }
}

export default AddUser;
