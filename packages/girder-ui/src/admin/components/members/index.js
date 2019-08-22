import {
  Link, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography
} from '@material-ui/core';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Members extends Component {
  render() {
    const {group, listOfMembers, search} = this.props;
    return(
      <div style={{margin:'10px'}}>
        <Typography style={{textAlign:'center'}} variant='h4' gutterBottom>
          {group.name}
        </Typography>
        <Paper style={{backgroundColor:'#37474F', display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
          <Typography variant='h6' style={{textAlign:'center', color:'white', margin:'auto'}}>
            <PeopleOutlineIcon color='primary' style={{marginRight:'5px', verticalAlign:'text-bottom'}}/>
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
                  <TableCell>{user.created.slice(0,10)}</TableCell>
                  <TableCell>{user.admin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Link
                      component='button'
                      onClick={(e) =>
                        {this.props.handleDelete(user._id, group, search)}
                      }
                    >
                      <DeleteOutlineIcon />
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

export default Members;
