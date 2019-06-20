import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TextField, Button } from '@material-ui/core';

class AddUser extends Component {
  render() {
    const {showSearch} = this.props;
    if(!showSearch) {
      return null;
    } else {
	return(
	  <div style={{ margin:'auto', display:'table', padding:'5px' }}>
	    <form noValidate autoComplete="off">
	      <TextField
		label='add-user'
		value={this.props.value}
		onChange={(e) => {this.props.handleChange(e)}}
		margin="normal"
		variant="outlined"
	      />
	    </form>
	    <Button style={{ margin:'auto', display:'block'}}
	      variant="contained"
	      onClick={this.props.handleSubmit}>
	      Submit
	    </Button>
	  </div>
	);
    }
  }
}

export default AddUser;
