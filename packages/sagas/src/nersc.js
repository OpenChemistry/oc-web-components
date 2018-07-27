import axios from 'axios';
import { put, call, takeEvery } from 'redux-saga/effects'
import Cookies from 'universal-cookie';

import { nersc } from '@openchemistry/redux'
import { girder } from '@openchemistry/redux'
import { app }  from '@openchemistry/redux'

var girderClient = axios.create({
  baseURL: window.location.origin,
});


export function authenticateNewt(username, password) {
  const data = new FormData()
  data.set('username', username)
  data.set('password', password)

  return axios.post('https://newt.nersc.gov/newt/auth/', data)
    .then(response => response.data)
}

export function authenticateWithGirder(sessionId) {
  return girderClient.put(`api/v1/newt/authenticate/${sessionId}`)
    .then(response => response.data)
}

export function* authenticateWithNersc(action) {
  const {username, password, reject, resolve} = action.payload;

  try {
    yield put(girder.setAuthenticating(true));
    yield put( nersc.authenticateWithNewt() )

    const {auth, newt_sessionid} = yield call(authenticateNewt, username, password)
    if (!auth) {
      throw Error('Invalid username or password.');
    }
    else {
      const me = yield call(authenticateWithGirder, newt_sessionid);
      const cookies = new Cookies();
      const token = cookies.get('girderToken');

      yield put(girder.newToken(token));
      yield put(girder.setMe(me));
      yield put(girder.setAuthenticating(false));
      yield put(girder.authenticated());
      yield put(app.showNerscLogin(false));
    }

    resolve();
  }
  catch(error) {
    yield put(  yield put( nersc.authenticateWithNewt(error) ))
    reject(error)
  }
}

export function* watchAuthenticateNersc() {
  yield takeEvery(nersc.AUTHENTICATE_NERSC, authenticateWithNersc)
}

