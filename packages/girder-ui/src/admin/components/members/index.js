import {
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import DeleteIcon from '@material-ui/icons/Delete';

class Members extends Component {
  render() {
    const { group, listOfMembers, showMembers } = this.props;
    if (!showMembers) {
      return null;
    } else {
      return(
	<div>
          <Typography style={{textAlign: 'center'}} variant="h4" gutterBottom>
            {group.name}
	  </Typography>
	  <Paper style={{ display: 'table', padding: '5px', margin: 'auto' }}>
	  <Table style={{ width:'auto', display:'block', margin: 'auto' }}>
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
          <TableBody style={{textAlign:'center'}}>
	    {listOfMembers.map((user) => (
	      <TableRow key={user._id}>
	        <TableCell>{ user.firstName }</TableCell>
	        <TableCell>{ user.lastName }</TableCell>
	        <TableCell>{ user.login }</TableCell>
	        <TableCell>{ user.created.slice(0,10) }</TableCell>
	        <TableCell>{ user.admin ? "Yes" : "No" }</TableCell>
	        <TableCell>
	          <Link component="button"
	            onClick={(e) => {
		      			this.props.handleDelete(user._id, group)}}>
		    			<DeleteIcon/>
	          </Link>
	        </TableCell>
	      </TableRow>
	    ))}
	  </TableBody>
	</Table>
        </Paper>
      </div>      
    );}
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
