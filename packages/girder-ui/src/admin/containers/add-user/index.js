import React, { Component } from 'react';
import { connect } from 'react-redux';

import AddUser from '../../components/add-user';

import { admin } from '@openchemistry/girder-redux';

class AddUserContainer extends Component {
  constructor(props) {
    super(props);
    this.state={value:''};
  }

  handleChange=(e) => {
    this.setState({value: e.target.value})
  }

  handleSubmit=() => {
    this.props.dispatch(admin.actions.fetchUsersList(this.state.value));
    this.setState({value:''});
  }

  handleKeyPress=(e) => {
    if (e.key==='Enter') {
      e.preventDefault();
      this.handleSubmit(e);
    }
  }
  render() {
    return (
      <AddUser
        handleSubmit={this.handleSubmit}
        handleChange={this.handleChange}
        handleKeyPress={this.handleKeyPress}
        value={this.state.value}
        {...this.props}
      />
    );
  }
}

function mapStateToProps(state) {
}

export default connect(mapStateToProps)(AddUserContainer);
