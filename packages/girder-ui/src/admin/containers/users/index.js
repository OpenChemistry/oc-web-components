import React, { Component } from 'react';

import { connect } from 'react-redux';

import Users from '../../components/users';

import { admin } from '@openchemistry/girder-redux';


class UsersContainer extends Component {
    handleAdd = (userId, group) => {
    this.props.dispatch(
      admin.actions.addMember({userId, group}));
  }
    
  render() {
    return (
      <Users
        handleAdd={this.handleAdd}
	{...this.props}/>
    );
  }
}

function usersMapStateToProps(state) {
    const usersById = admin.selectors.getUsersByIds(state);
    const group = admin.selectors.getCurrentGroup(state);
    const showUsers = admin.selectors.getUsersVisibility(state);

    const listOfUsers = [];
    
    for (const [key, value] of Object.entries(usersById)) {
	listOfUsers.push(value);
    }

    return {
	group,
        listOfUsers,
	showUsers
    };
}

UsersContainer = connect(usersMapStateToProps)(UsersContainer)

export default UsersContainer;
