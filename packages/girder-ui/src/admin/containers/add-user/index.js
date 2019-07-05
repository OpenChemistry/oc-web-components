import React, { Component } from 'react';

import { connect } from 'react-redux';

import AddUser from '../../components/add-user';

import { admin } from '@openchemistry/girder-redux';

class AddUserContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {value:''};
  }

  handleChange = (e) => {
    this.setState({value: e.target.value})
  }

  handleSubmit = (e) => {
    this.props.dispatch(admin.actions.showUsers(true));
    this.props.dispatch(admin.actions.fetchUsersList(this.state.value));
    this.setState({value:''});
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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

function addUserMapStateToProps(state) {
  const showSearch = admin.selectors.getMembersVisibility(state);
  return {
    showSearch
  };
}

AddUserContainer = connect(addUserMapStateToProps)(AddUserContainer)

export default AddUserContainer;
