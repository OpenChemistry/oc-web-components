import { isNil } from 'lodash-es'

import { get } from '../'


export function fetchMe(token) {
  const params = {

  }

  if (!isNil(token)) {
    params.headers = {
      'Girder-Token': token
    }
  }

  return get('user/me', params)
    .then(response => response.data)
}

export function logIn(username, password) {
  const params = {

  };
  let authStr = btoa(`${username}:${password}`);
  params.headers = {
    'Girder-Authorization': `Basic ${authStr}`
  }
  return get('user/authentication', params)
    .then(response => response.data);
}
