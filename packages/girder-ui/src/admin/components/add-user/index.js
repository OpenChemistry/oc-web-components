import React, { Component } from 'react';

import { TextField, Button, Tooltip } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

class AddUser extends Component {
  render() {
    const {showSearch} = this.props;
    if(!showSearch) {
      return null;
    } else {
      return(
        <div style={{ margin: 'auto', display: 'table', padding: '5px' }}>
          <form noValidate autoComplete="off">
          <Tooltip title='Search for a user by name, or submit an empty search to return all possible users.'>
            <TextField
              label = 'Add User'
              value = {this.props.value}
              onChange = {(e) => { this.props.handleChange(e) }}
              margin = "normal"
              variant = "outlined"
              onKeyPress={(e) => { this.props.handleKeyPress(e) }}
            />
          </Tooltip>
          </form>
          <Button style={{ margin:'auto', display:'block'}}
            variant="contained"
            onClick={(e) => {this.props.handleSubmit(e)}}>
              <SearchIcon />
          </Button>
        </div>
      );
    }
  }
}

export default AddUser;
