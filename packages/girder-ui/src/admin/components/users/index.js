import {
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import PersonAddIcon from '@material-ui/icons/PersonAdd';

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
		    <PersonAddIcon/>
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
