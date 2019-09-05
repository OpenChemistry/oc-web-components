import {
  withStyles, Link, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Typography
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import PeopleIcon from '@material-ui/icons/People';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment'

const styles = () => ({
  root: {
    margin:'10px'
  },
  header: {
    textAlign:'center'
  },
  paper: {
    backgroundColor:'#37474F',
    display:'flex',
    justifyContent:'space-between',
    marginBottom:'5px'
  },
  title: {
    textAlign:'center',
    color:'white',
    margin:'auto'
  },
  icon: {
    marginRight:'5px',
    verticalAlign:'text-bottom'
  }
});

class Members extends Component {
  render() {
    const {group, listOfMembers, search, classes} = this.props;
    return(
      <div className={classes.root}>
        <Typography className={classes.header} variant='h4' gutterBottom>
          {group.name}
        </Typography>
        <Paper className={classes.paper}>
          <Typography variant='h6' className={classes.title}>
            <PeopleIcon color='primary' className={classes.icon}/>
            Current Members
          </Typography>
        </Paper>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Date Created</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Remove User</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listOfMembers.map((user) => (
                <TableRow key={ user._id }>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.login}</TableCell>
                  <TableCell>{moment(user.created).calendar()}</TableCell>
                  <TableCell>{user.admin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Link
                      component='button'
                      onClick={(e) =>
                        {this.props.handleDelete(user._id, group, search)}
                      }
                    >
                      <DeleteIcon />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

Members.propTypes = {
  listOfMembers: PropTypes.array,
  group: PropTypes.object
}

Members.defaultProps = {
  listOfMembers: [],
  group: {}
}

export default withStyles(styles)(Members);
