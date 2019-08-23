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
  linkToOrcidFailed
} from '../../ducks/user';

import {
  updateUserInformation as restUpdateUser,
  fetchUserData as restFetchUser,
  twitterLogin,
  orcidLogin,
  twitterId,
  orcidId
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
    const tData = yield call (twitterLogin, id, values.twitterId)
    const oData = yield call (orcidLogin, id, values.orcidId)
    const tId = tData.twitter
    const oId = oData.orcid
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