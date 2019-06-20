import React, { Component } from 'react';

import { connect } from 'react-redux';

import Groups from '../../components/groups';

import { admin } from '@openchemistry/girder-redux';


class GroupsContainer extends Component {
    
    componentDidMount() {
    	this.props.dispatch(admin.actions.fetchGroupsList());
    }

    handleClick = (group) => {
	this.props.dispatch(
	    admin.actions.showMembers(true));
	this.props.dispatch(
	    admin.actions.showUsers(false));
	this.props.dispatch(
	    admin.actions.fetchMembersList(group));
    }

    handleDelete = (groupid) => {
	this.props.dispatch(
	    admin.actions.showMembers(false));
	this.props.dispatch(
	    admin.actions.removeGroup(groupid));
    }
    
    render() {
      return (
        <Groups
	  handleClick={this.handleClick}
	  handleDelete={this.handleDelete}
	  {...this.props}/>
      );
    }
}

function groupsMapStateToProps(state) {
    const groupsById = admin.selectors.getGroupsByIds(state);

    const listOfGroups = [];
    
    for (const [key, value] of Object.entries(groupsById)) {
       listOfGroups.push(value);	
    }

    return {
        listOfGroups
    };
}

GroupsContainer = connect(groupsMapStateToProps)(GroupsContainer)

export default GroupsContainer;
