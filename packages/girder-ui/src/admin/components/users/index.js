import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Table, TableHead, TableBody,
	 TableRow, TableCell, Link,
         FormControl, InputLabel, Select,
         MenuItem, Button, Paper } from '@material-ui/core';

class Users extends Component {
  render() {    
    const { group, listOfUsers, showUsers } = this.props;
    if (!showUsers) {
      return null;
    } else {
      return(
        <Paper style={{ display:'table', padding:'5px', margin:'auto' }}>	   
        <Table style={{ width:'auto', display:'block', margin:'auto' }}>
	  <TableHead>
            <TableRow>
	      <TableCell>Name</TableCell>
	      <TableCell>Username</TableCell>
	      <TableCell>Add User</TableCell>
	    </TableRow>
	  </TableHead>
          <TableBody>
	    {listOfUsers.map((person) => (
	      <TableRow key={person._id}>
	        <TableCell>
		  { person.firstName + " " +  person.lastName }
		</TableCell>
	        <TableCell>
		  { person.login }
		</TableCell>
		<TableCell>
	          <Link component="button"
		    onClick={(e) => {
		      this.props.handleAdd(person._id, group)}}>
		    Add
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
}

Users.propTypes = {
    listOfUsers: PropTypes.array
}

Users.defaultProps = {
    listOfUsers: []
}

export default Users;
