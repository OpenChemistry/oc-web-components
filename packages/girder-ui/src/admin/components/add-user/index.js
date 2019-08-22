import React, { Component } from 'react';
import { TextField, Button, Tooltip, Paper, Typography } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';

class AddUser extends Component {
  render() {
    return(
      <div style={{margin:'50px 10px 0'}}>
        <Paper style={{backgroundColor:'#37474F', marginBottom:'5px'}}>
          <Typography variant='h6' style={{textAlign:'center', color:'white'}}>
            <PersonOutlineIcon color='white' style={{marginRight:'5px', verticalAlign:'text-bottom'}}/>
            Add User
          </Typography>
        </Paper>
        <form style={{display:'flex', alignItems:'center', justifyContent:'flex-end'}}>
          <Tooltip title='Search for a user by name, or submit an empty search to return all possible users.'>
            <TextField
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
