import { put, call, takeEvery} from 'redux-saga/effects'
import Cookies from 'universal-cookie'
import { isNil } from 'lodash-es';

import {
  AUTHENTICATE,
  LOAD_ME,
  INVALIDATE_TOKEN,
  LOAD_OAUTH_PROVIDERS,
  SET_TOKEN,
  USERNAME_LOGIN,
  NERSC_LOGIN,
  TEST_OAUTH_ENABLED,
  LOAD_TOKEN_FROM_API_KEY
} from '../../ducks/auth';

import {
  requestOauthProviders,
  receiveOauthProviders,
  requestInvalidateToken,
  requestMe,
  receiveMe,
  setToken,
  setAuthenticating,
  setMe,
  setOauthEnabled,
  loadOauthProviders,
  requestTokenFromApiKey
} from '../../ducks/auth';

import {
  fetchMe as fetchMeRest,
  fetchProviders,
  invalidateToken as invalidateTokenRest,
  logIn as logInRest,
  nerscLogIn as nerscLogInRest,
  authenticateWithNewt as authenticateWithNewtRest,
  fetchTokenFromApiKey as fetchTokenFromApiKeyRest
} from '../../rest/auth';

import girderClient from '@openchemistry/girder-client';

function* fetchOauthProviders(action) {
  try {
    yield put( requestOauthProviders() )
    const providers = yield call(fetchProviders, action.payload);
    yield put( receiveOauthProviders(providers) );
  }
  catch(error) {
    yield put(  requestOauthProviders(error) );
  }
}

export function* watchFetchOauthProviders() {
  yield takeEvery(LOAD_OAUTH_PROVIDERS, fetchOauthProviders);
}

function* testOauthEnabled() {
  try {
    yield call(fetchProviders, 'dummy');
    yield put( setOauthEnabled(true) );
  }
  catch(error) {
    yield put( setOauthEnabled(false) );
  }
}

export function* watchTestOauthEnabled() {
  yield takeEvery(TEST_OAUTH_ENABLED, testOauthEnabled);
}

function updateToken(action) {
  const girderToken = action.payload;
  if (girderToken !== null) {
    girderClient().updateToken(girderToken);
  }

  const cookies = new Cookies();
  cookies.set('girderToken', girderToken, {
    path: '/'
  });
}

export function* watchNewToken() {
  yield takeEvery(SET_TOKEN, updateToken);
}

function* authenticate(action) {
  const payload = action.payload;
  const token = payload.token;
  const redirect = payload.redirect;
  yield put(setAuthenticating(true));
  let me = null;
  let auth = false;
  if (!isNil(token)) {
    me = yield call(fetchMeRest, token);
    if (me != null) {
      yield put(setToken(token));
      yield put(setMe(me));
      yield put(setAuthenticating(false));
      auth = true;
    }
  }

  if (!auth) {
    if (redirect) {
      const redirect = window.location.href;
      yield put(loadOauthProviders(redirect));
    }
    else {
      yield put(setAuthenticating(false));
    }
  }

}

export function* watchAuthenticate() {
  yield takeEvery(AUTHENTICATE, authenticate)
}

function* invalidateToken(action) {
  try {
    yield put( requestInvalidateToken() )
    yield call(invalidateTokenRest)
    yield put( setToken(null) )
    yield put( receiveMe(null) )
  }
  catch(error) {
    yield put( requestInvalidateToken(error) )
  }
}

export function* watchInvalidateToken() {
  yield takeEvery(INVALIDATE_TOKEN, invalidateToken)
}

function* fetchMe(action) {
  try {
    yield put( requestMe() )
    const me = yield call(fetchMeRest)
    yield put( receiveMe(me) )
  }
  catch(error) {
    yield put( requestMe(error) )
  }
}

export function* watchFetchMe() {
  yield takeEvery(LOAD_ME, fetchMe)
}

function* usernameLogin(action) {
  const { username, password, resolve, reject} = action.payload;

  try {
    const res = yield call(logInRest, username, password);

    const token = res.authToken.token;
    yield put(setToken(token));

    const me = res.user;
    yield put(setMe(me));

    yield put(setAuthenticating(false));
    // yield put(showGirderLogin(false));

    if (resolve) {
      resolve();
    }
  }
  catch(error) {
    if (reject) {
      reject('Unable to login with the provided credentials');
    }
  }
}

export function* watchUsernameLogin() {
  yield takeEvery(USERNAME_LOGIN, usernameLogin);
}

function* nerscLogin(action) {
  const { username, password, resolve, reject} = action.payload;

  try {
    const {auth, sessionId} = yield call(nerscLogInRest, username, password);

    if (!auth) {
      throw Error('Invalid username or password.');
    }
    const me = yield call(authenticateWithNewtRest, sessionId);
    const cookies = new Cookies();
    const token = cookies.get('girderToken');

    yield put(setToken(token));
    yield put(setMe(me));
    yield put(setAuthenticating(false));
    // yield put(showNerscLogin(false));

    if (resolve) {
      resolve();
    }
  }
  catch(error) {
    if (reject) {
      reject('Unable to login with the provided credentials');
    }
  }
}

export function* watchNerscLogin() {
  yield takeEvery(NERSC_LOGIN, nerscLogin);
}

function* loadTokenFromApiKey(action) {
  try {
    const key = action.payload;
    const tokenResponse = yield call(fetchTokenFromApiKeyRest, key);
    yield put(setToken(tokenResponse.token));
  }
  catch(error) {
    yield put( requestTokenFromApiKey(error) );
  }
}

export function* watchLoadTokenFromApiKey() {
  yield takeEvery(LOAD_TOKEN_FROM_API_KEY, loadTokenFromApiKey);
}
