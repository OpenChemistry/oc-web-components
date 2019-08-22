import {
  Link, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Users extends Component {
  render() {
    const {group, possibleUsers, search}=this.props;
    const query=search ? "'"+search+"'" : 'all available users'
    if (possibleUsers.length) {
      return(
        <div>
          <Typography style={{textAlign: 'center'}} variant='subtitle1'>
          Showing search results for {query}:
          </Typography>
          <Paper style={{paddingTop:'5px', margin:'10px'}}>
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
        <Typography style={{textAlign: 'center'}}>No Users to Add</Typography>
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

export default Users;
