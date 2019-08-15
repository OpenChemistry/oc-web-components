import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Table,
	 TableHead,
	 TableBody,
	 TableRow,
	 TableCell,
         Link, Paper } from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';

class Groups extends Component {
  render() {
    const { listOfGroups } = this.props;
    return(
      <Paper style={{margin: '20px', maxWidth: '100%', padding: '5px'}}>
      <Table>
	<TableHead>
          <TableRow>
	    <TableCell>Group Name</TableCell>
	    <TableCell>Decription</TableCell>
	    <TableCell>Date Created</TableCell>
	    <TableCell>Last Updated</TableCell>
	    <TableCell>Status</TableCell>
	    <TableCell>Delete Group</TableCell>  
	  </TableRow>
	</TableHead>
        <TableBody>
	  {listOfGroups.map((group) => (
	    <TableRow key={group._id}>
	      <TableCell>
                <Link component="button"
	          group={group}
	          onClick={(e) => {this.props.handleClick(group)}}>
		  { group.name }
                </Link>	      
	      </TableCell>
	      <TableCell>{ group.description }</TableCell>
	      <TableCell>{ group.created.slice(0,10) }</TableCell>
	      <TableCell>{ group.updated.slice(0,10)
			   + " at "
			   + group.updated.slice(11, 19) }</TableCell>
	      <TableCell>{ group.public ? "Public" : "Private" }</TableCell>
	      <TableCell>
		<Link component="button"
	          onClick={(e) => {
		    this.props.handleDelete(group._id)}}>
		  		<DeleteIcon/>
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

Groups.propTypes = {
    listOfGroups: PropTypes.array
}

Groups.defaultProps = {
    listOfGroups: []
}

export default Groups;
