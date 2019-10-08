import React, { Component } from 'react';
import { connect } from 'react-redux';
import ApiKeys from '../../components/api-keys';

import { user } from '@openchemistry/girder-redux';

class ApiKeysContainer extends Component {
  componentDidMount() {
    this.props.dispatch(user.actions.requestApiKeys());
  }

  handleShowForm = () => {
    this.props.dispatch(user.actions.showApiForm(true));
  }

  handleEdit = (key, activation) => {
    if (activation) {
      key.active = !key.active
    }
    this.props.dispatch(user.actions.editApiKey(key));
  }

  handleDelete = (id) => {
    this.props.dispatch(user.actions.deleteApiKey(id));
  }

  handleSubmit = (key) => {
    this.props.dispatch(user.actions.createApiKey(key));
  }

  render() {
    return (
      <ApiKeys
        handleEdit={this.handleEdit}
        handleDelete={this.handleDelete}
        handleSubmit={this.handleSubmit}
        {...this.props}
      />
    );
  }
}

function keysMapStateToProps(state) {
  const values = user.selectors.getApiKeys(state);

  const apiKeys=[];

  for (const [key, value] of Object.entries(values)) {
    apiKeys.push(value);
  }

  return { apiKeys }
}

ApiKeysContainer = connect(keysMapStateToProps)(ApiKeysContainer)

export default ApiKeysContainer;
