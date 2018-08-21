import { isNil } from 'lodash-es';
import girderClient from './girder-client';

export function fetchProviders(redirect) {
  return girderClient().get('oauth/provider', {
    params: {
      redirect
    }
  })
  .then(response => response.data )
}

export function invalidateToken() {
  return girderClient().delete(`token/session`)
    .then(response => response.data );
}

export function fetchMe(token) {
  const config = {

  }

  if (!isNil(token)) {
    config.headers = {
      'Girder-Token': token
    }
  }

  return girderClient().get('user/me', config)
    .then(response => response.data);
}

export function logIn(username, password) {
  const config = {

  };
  let authStr = btoa(`${username}:${password}`);
  config.headers = {
    'Girder-Authorization': `Basic ${authStr}`
  }
  return girderClient().get('user/authentication', config)
    .then(response => response.data);
}

