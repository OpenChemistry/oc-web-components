import { isNil } from 'lodash-es'

import { girderClient } from '@openchemistry/girder-redux';


export function fetchMe(token) {
  const params = {

  }

  if (!isNil(token)) {
    params.headers = {
      'Girder-Token': token
    }
  }

  return girderClient().get('user/me', params)
    .then(response => response.data)
}

export function logIn(username, password) {
  const params = {

  };
  let authStr = btoa(`${username}:${password}`);
  params.headers = {
    'Girder-Authorization': `Basic ${authStr}`
  }
  return girderClient().get('user/authentication', params)
    .then(response => response.data);
}
