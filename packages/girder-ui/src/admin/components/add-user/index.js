import React, { Component } from 'react';

import { TextField, Button, Tooltip } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

class AddUser extends Component {
  render() {
    return(
      <div style={{display:'flex', padding:'5px', justifyContent:'flex-end', margin:'10px'}}>
        <form noValidate autoComplete="off" style={{display:'contents'}}>
          <Tooltip title='Search for a user by name, or submit an empty search to return all possible users.'>
            <TextField
              fullWidth
              variant='filled'
              style={{verticalAlign:'sub'}}
              label='Search for User'
              value={this.props.value}
              onChange={(e) => {this.props.handleChange(e)}}
              onKeyPress={(e) => {this.props.handleKeyPress(e)}}
            />
          </Tooltip>
          <Button
            style={{marginLeft:'10px'}}
            color='primary'
            variant='contained'
            onClick={(e) => {this.props.handleSubmit(e)}}>
              <SearchIcon />
          </Button>
        </form>
      </div>
    );
  }
}

export default AddUser;
