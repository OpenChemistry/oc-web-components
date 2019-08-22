import React, { Component } from 'react';

import { connect } from 'react-redux';

import Users from '../../components/users';

import { admin } from '@openchemistry/girder-redux';


class UsersContainer extends Component {
  componentDidMount() {
    this.props.dispatch(
      admin.actions.fetchUsersList(''));
  }

  handleAdd=
    (userId, group) => {
      this.props.dispatch(admin.actions.addMember({userId, group}));
  }

  render() {
    return (
      <Users
        handleAdd={this.handleAdd}
        {...this.props}
      />
    );
  }
}

function usersMapStateToProps(state) {
  const usersById=admin.selectors.getUsersByIds(state);
  const membersById=admin.selectors.getMembersByIds(state);
  const group=admin.selectors.getCurrentGroup(state);
  const search=admin.selectors.getUserSearch(state);

  const listOfUsers=[];
  const listOfMembers=[];


  for (const [key, value] of Object.entries(usersById)) {
    listOfUsers.push(value);
  }
  for (const [key, value] of Object.entries(membersById)) {
    listOfMembers.push(value);
  }

  const possibleUsers = listOfUsers.filter(function (user) {
    return !listOfMembers.some(function (member) {
      return member._id === user._id;
    })
  });

  return {
    group,
    possibleUsers,
    search
  };
}

UsersContainer = connect(usersMapStateToProps)(UsersContainer)

export default UsersContainer;
