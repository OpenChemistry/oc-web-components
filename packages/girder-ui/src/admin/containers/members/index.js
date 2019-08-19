import React, { Component } from 'react';

import { connect } from 'react-redux';

import Members from '../../components/members';

import { admin } from '@openchemistry/girder-redux';


  class MembersContainer extends Component {
    handleDelete=(userId, group, search) => {
      this.props.dispatch(
        admin.actions.removeMember({
          userId, group
      }));

      this.props.dispatch(
        admin.actions.fetchUsersList(search));
    }

    render() {
      return (
        <Members
          handleDelete={this.handleDelete}
          {...this.props}
        />
      );
    }
  }

  function membersMapStateToProps(state) {
    const membersById=admin.selectors.getMembersByIds(state);
    const group=admin.selectors.getCurrentGroup(state);
    const search=admin.selectors.getUserSearch(state);

    const listOfMembers=[];

    for (const [key, value] of Object.entries(membersById)) {
      listOfMembers.push(value);
    }

    return {
      group,
      listOfMembers,
      search
    };
  }

MembersContainer=connect(membersMapStateToProps)(MembersContainer)

export default MembersContainer;
