import { call, put, takeEvery } from 'redux-saga/effects'

import {
  fetchUserData,
  userDataReceived,
  fetchUserDataFailed,
  updateUserInformation,
  userUpdateFailed,
  linkToTwitter,
  twitterLinked,
  linkToTwitterFailed,
  linkToOrcid,
  orcidLinked,
  linkToOrcidFailed,
  requestApiKeys,
  receiveApiKeys,
  apiKeyFailed,
  createApiKey,
  editApiKey,
  deleteApiKey
} from '../../ducks/user';

import {
  updateUserInformation as restUpdateUser,
  fetchUserData as restFetchUser,
  twitterLogin,
  orcidLogin,
  twitterId,
  orcidId,
  getApiKeys as getKeys,
  deleteApiKey as deleteKey,
  editApiKey as editKey,
  createApiKey as createKey
} from '../../rest/user';

function* onFetchUserInformation(action) {
  try {
    const info = yield call(restFetchUser)
    const tId = yield call (twitterId, info._id)
    const oId = yield call (orcidId, info._id)
    yield put( userDataReceived({info, tId, oId}) )
  } catch(error) {
    yield put(fetchUserDataFailed)
  }
}

export function* watchFetchUserInformation() {
  yield takeEvery(fetchUserData.toString(), onFetchUserInformation)
}

function* onUpdateUserInformation(action) {
  try {
    const {id, values} = action.payload;
    const info = yield call (restUpdateUser, id, values);
    var data = yield call (twitterLogin, id, values.twitterId)
    const tId = data.twitter
    var data = yield call (orcidLogin, id, values.orcidId)
    const oId = data.orcid;
    yield put( userDataReceived({info, tId, oId}) );
  } catch(error) {
    yield put( userUpdateFailed(error) );
  }
}

export function* watchUpdateUserInformation() {
  yield takeEvery(updateUserInformation.toString(), onUpdateUserInformation);
}

function* onTwitterLogin(action) {
  try {
    const { userId, mediaId } = action.payload;
    yield call(twitterLogin, userId, mediaId);
    yield put( twitterLinked(mediaId) );
  } catch(error) {
    yield put( linkToTwitterFailed(error) );
  }
}

export function* watchTwitterLogin() {
  yield takeEvery(linkToTwitter.toString(), onTwitterLogin);
}

function* onOrcidLogin(action) {
  try {
    const { userId, mediaId } = action.payload;
    yield call(orcidLogin, userId, mediaId);
    yield put( orcidLinked(mediaId) );
  } catch(error) {
    yield put( linkToOrcidFailed(error) );
  }
}

export function* watchOrcidLogin() {
  yield takeEvery(linkToOrcid.toString(), onOrcidLogin);
}

function* onApiKeyEdited(action) {
  try {
    const key = action.payload;
    yield call(editKey, key);
    yield call(onApiKeyRequested);
  } catch (error) {
    yield put( apiKeyFailed(error) );
  }
}

export function* watchApiKeyEdited() {
  yield takeEvery(editApiKey.toString(), onApiKeyEdited);
}

function* onApiKeyCreated(action) {
  try {
    const key = action.payload;
    yield call(createKey, key);
    yield call(onApiKeyRequested);
  } catch (error) {
    yield put( apiKeyFailed(error) );
  }
}

export function* watchApiKeyCreated() {
  yield takeEvery(createApiKey.toString(), onApiKeyCreated);
}

function* onApiKeyDeleted(action) {
  try {
    const id = action.payload;
    yield call(deleteKey, id);
    yield call(onApiKeyRequested);
  } catch (error) {
    yield put( apiKeyFailed(error) );
  }
}

export function* watchApiKeyDeleted() {
  yield takeEvery(deleteApiKey.toString(), onApiKeyDeleted);
}

function* onApiKeyRequested(action) {
  try {
    const keys = yield call(getKeys);
    yield put( receiveApiKeys(keys) )
  } catch (error) {
    yield put( apiKeyFailed(error) );
  }
}

export function* watchApiKeyRequested() {
  yield takeEvery(requestApiKeys.toString(), onApiKeyRequested);
}