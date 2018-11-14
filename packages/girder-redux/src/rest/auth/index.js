import { isNil } from 'lodash-es';
import girderClient from '@openchemistry/girder-client';
import axios from 'axios';

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

export function nerscLogIn(username, password, mfa='') {
  const data = new FormData()
  data.set('username', username)
  data.set('password', password + mfa)

  return axios.post('https://newt.nersc.gov/newt/auth/', data)
    .then(response => response.data)
}

export function authenticateWithNewt(sessionId) {
  return girderClient().put(`newt/authenticate/${sessionId}`)
    .then(response => response.data)
}

export function fetchTokenFromApiKey(key) {
  return girderClient().post('api_key/token', {}, {
    params: {
      key
    }
  })
    .then(response => response.data);
}
