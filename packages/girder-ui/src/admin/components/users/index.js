import {
  Link, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Users extends Component {
  render() {
    const {group, possibleUsers, showUsers, search}=this.props;
    const query=search ? search : 'all available users'
    return(
      <Paper style={{display:'table', padding:'5px', margin:'auto'}}>
        <Typography style={{textAlign: 'center'}} variant='subtitle1' gutterBottom>
          Showing search results for {query}:
        </Typography>
        <Table style={{width:'auto', display:'block', margin:'auto'}}>
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
    );
  }
}

Users.propTypes = {
  possibleUsers: PropTypes.array
}

Users.defaultProps = {
  possibleUsers: []
}

export default Users;
