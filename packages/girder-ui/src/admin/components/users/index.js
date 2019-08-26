import {
  withStyles, Link, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Typography
} from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

const styles = () => ({
  root: {
    paddingTop:'5px',
    margin:'10px'
  },
  typography: {
    textAlign: 'center'
  },
});

class Users extends Component {
  render() {
    const {group, possibleUsers, search, classes}=this.props;
    const query=search ? "'"+search+"'" : 'all available users'
    if (possibleUsers.length) {
      return(
        <div>
          <Typography className={classes.typography} variant='subtitle1'>
          Showing search results for {query}:
          </Typography>
          <Paper className={classes.root}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Add User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {possibleUsers.map((person) => (
                  <TableRow key={person._id}>
                    <TableCell>
                      {person.firstName+' '+person.lastName}
                    </TableCell>
                    <TableCell>{person.login}</TableCell>
                    <TableCell>
                      <Link
                        component='button'
                        onClick={(e) =>
                          {this.props.handleAdd(person._id, group)}
                        }
                      >
                        <PersonAddIcon />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </div>
      );
    } else { 
      return (
        <Typography className={classes.typography}>No Users to Add</Typography>
      );
    }
  }
}

Users.propTypes = {
  possibleUsers: PropTypes.array
}

Users.defaultProps = {
  possibleUsers: []
}

export default withStyles(styles)(Users);
