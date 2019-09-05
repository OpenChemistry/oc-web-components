import React, { Component } from 'react';
import {
  withStyles, TextField, Button, Tooltip, Paper, Typography
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import PersonIcon from '@material-ui/icons/Person';

const styles = () => ({
  root: {
    margin:'50px 10px 0'
  },
  paper: {
    backgroundColor:'#37474F',
    marginBottom:'5px'
  },
  typography: {
    textAlign:'center',
    color:'white'
  },
  icon: {
    marginRight:'5px',
    verticalAlign:'text-bottom'
  },
  form: {
    display:'flex',
    alignItems:'center',
    justifyContent:'flex-end'
  },
  button: {
    marginLeft:'10px'
  },
});

class AddUser extends Component {
  render() {
    const {classes}=this.props
    return(
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Typography variant='h6' className={classes.typography}>
            <PersonIcon color='primary' className={classes.icon}/>
            Add User
          </Typography>
        </Paper>
        <form className={classes.form}>
          <Tooltip title='Search for a user by name, or submit an empty search to return all possible users.'>
            <TextField
              label='Search for User'
              value={this.props.value}
              onChange={(e) => {this.props.handleChange(e)}}
              onKeyPress={(e) => {this.props.handleKeyPress(e)}}
            />
          </Tooltip>
          <Button
            className={classes.button}
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

export default withStyles(styles)(AddUser);
