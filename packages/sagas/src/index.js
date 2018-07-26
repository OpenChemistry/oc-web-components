import axios from 'axios';
import { put, call, fork, takeEvery, take, select } from 'redux-saga/effects'
import Cookies from 'universal-cookie';

import { isNil } from 'lodash-es';

import { molecules } from '@openchemistry/redux';
import { calculations } from '@openchemistry/redux';
import { users } from '@openchemistry/redux';
import { girder } from '@openchemistry/redux';
import { cumulus } from '@openchemistry/redux';
import { selectors } from '@openchemistry/redux';

import { watchNotifications } from './notifications'
import { watchAuthenticateNersc } from './nersc'
import { watchLoadNotebooks, watchLoginGirder } from './app'
import { watchRedirectToJupyterHub, watchInvalidateSession } from './jupyterlab'
import { user, token } from '@openchemistry/rest'
import * as rest from '@openchemistry/rest'
import { girderClient  } from '@openchemistry/rest'
import { watchLoadCalculationNotebooks } from './calculations'

import jp from 'jsonpath';

// var jp = require('jsonpath')

export function fetchMoleculesFromGirder() {
  return girderClient().get('molecules')
          .then(response => response.data )
}

export function fetchMoleculeFromGirder(inchikey) {
  return girderClient().get(`molecules/inchikey/${inchikey}`)
          .then(response => response.data )
}

export function fetchMoleculeByIdFromGirder(id) {
  return girderClient().get(`molecules/${id}`)
          .then(response => response.data )
}

// Users

export function fetchUserMeFromGirder() {
  return girderClient().get('user/me')
          .then(response => response.data )
}

export function* fetchUserMe(action) {
  try {
    yield put( users.requestUserMe() )
    const me = yield call(fetchUserMeFromGirder)
    yield put( users.receiveUserMe(me) )
  }
  catch(error) {
    yield put( users.requestUserMe(error) )
  }
}

export function* watchFetchUserMe() {
  yield takeEvery(users.LOAD_USER_ME, fetchUserMe)
}


export function isValidToken(token) {
  const headers = {
      'Girder-Token': token
  }
  const origin = window.location.origin;

  return axios.get(`${origin}/api/v1/user/me`, {headers})
    .then(response => response.data != null )
}

// Molecules

export function* fetchMolecules() {
  try {
    yield put( molecules.requestMolecules() )
    const molecules = yield call(fetchMoleculesFromGirder)
    yield put( molecules.receiveMolecules(molecules) )
  }
  catch(error) {
    yield put( molecules.requestMolecules(error) )
  }
}

export function* fetchMolecule(action) {
  try {
    yield put( molecules.requestMolecule(action.payload.inchikey) )
    const molecule = yield call(fetchMoleculeFromGirder, action.payload.inchikey)
    yield put( molecules.receiveMolecule(molecule) )
  }
  catch(error) {
    yield put( molecules.requestMolecule(error) )
  }
}

export function* fetchMoleculeById(action) {
  try {
    yield put( molecules.requestMoleculeById(action.payload.id) )
    const molecule = yield call(fetchMoleculeByIdFromGirder, action.payload.id)
    yield put( molecules.receiveMolecule(molecule) )
  }
  catch(error) {
    yield put( molecules.requestMoleculeById(error) )
  }
}

console.log(molecules);

export function* watchFetchMolecules() {
  yield takeEvery(molecules.LOAD_MOLECULES, fetchMolecules)
}

export function* watchFetchMolecule() {
  yield takeEvery(molecules.LOAD_MOLECULE, fetchMolecule)
}

export function* watchFetchMoleculeById() {
  yield takeEvery(molecules.LOAD_MOLECULE_BY_ID, fetchMoleculeById)
}

export function fetchCalculationByIdFromGirder(id) {
  return girderClient().get(`calculations/${id}`)
          .then(response => response.data )
}
export function* fetchCalculationById(action) {
  try {
    yield put( calculations.requestCalculationById(action.payload.id) )
    const calculation = yield call(fetchCalculationByIdFromGirder, action.payload.id)
    yield put( calculations.receiveCalculation(calculation) )
  }
  catch(error) {
    yield put( calculations.requestCalculationById(error) )
  }
}

export function* watchFetchCalculationById() {
  yield takeEvery(calculations.LOAD_CALCULATION_BY_ID, fetchCalculationById)
}

// mo
export function fetchOrbitalFromGirder(id, mo) {
  return girderClient().get(`calculations/${id}/cube/${mo}`)
          .then(response => response.data )
}
export function* fetchOrbital(action) {
  try {
    yield put( calculations.requestOrbital(action.payload.id, action.payload.mo) )
    const orbital = yield call(fetchOrbitalFromGirder, action.payload.id, action.payload.mo)
    yield put( calculations.receiveOrbital(action.payload.id, action.payload.mo, orbital) )
  }
  catch(error) {
    yield put(  calculations.requestOrbital(error) )
  }
}

export function* watchFetchOrbital() {
  yield takeEvery(calculations.LOAD_ORBITAL, fetchOrbital)
}

// Auth

// Fetch OAuth providers
export function fetchOAuthProvidersFromGirder(redirect) {
  const params = {
    params: {
      redirect
    }
  }
  return girderClient().get(`oauth/provider`, params)
    .then(response => response.data )
}

export function* fetchOauthProviders(action) {
  try {
    yield put( girder.requestOauthProviders() )
    const providers = yield call(fetchOAuthProvidersFromGirder, action.payload)
    yield put( girder.receiveOauthProviders(providers) )
  }
  catch(error) {
    yield put(  girder.requestOauthProviders(error) )
  }
}

export function* watchFetchOauthProviders() {
  yield takeEvery(girder.LOAD_OAUTH_PROVIDERS, fetchOauthProviders)
}

export function* testOauthEnabled(action) {
  try {
    yield call(fetchOAuthProvidersFromGirder, 'dummy')
    yield put( girder.setOauthEnabled(true) )
  }
  catch(error) {
    yield put( girder.setOauthEnabled(false) )
  }
}

export function* watchTestOauthEnabled() {
  yield takeEvery(girder.TEST_OAUTH_ENABLED, testOauthEnabled)
}

export function* updateToken(action) {
  const girderToken = action.payload.token;
  if (girderToken !== null) {
    rest.updateToken(girderToken)
  }

  const cookies = new Cookies();
  cookies.set('girderToken', girderToken, {
    path: '/'
  });

  // Reconnect to the event stream using the new token
  yield put(girder.connectToNotifications());
}

export function* watchNewToken() {
  yield takeEvery(girder.NEW_TOKEN, updateToken)
}

export function* authenticate(action) {
  const payload = action.payload;
  const token = payload.token;
  const redirect = payload.redirect;
  let auth = false;
  let me = null;
  yield put(girder.setAuthenticating(true));

  if (!isNil(token)) {

    me = yield call(user.fetchMe, token);
    if (me != null) {
      yield put(girder.newToken(token));
      yield put(girder.setMe(me))
      yield put(girder.setAuthenticating(false))
      yield put(girder.authenticated())
      auth = true
    }
  }

  if (!auth) {
    if (redirect) {
      const redirect = window.location.href;
      yield put(girder.loadOauthProviders(redirect));
    }
    else {
      yield put(girder.setAuthenticating(false));
    }
  }
}

export function* watchAuthenticate() {
  yield takeEvery(girder.AUTHENTICATE, authenticate)
}

export function* invalidateToken(action) {
  try {
    yield put( girder.requestTokenInvalidation() )
    yield call(token.invalidate)
    yield put( girder.newToken(null) )
    yield put( girder.setMe(null) )
  }
  catch(error) {
    yield put( girder.requestTokenInvalidation(error) )
  }
}

export function* watchInvalidateToken() {
  yield takeEvery(girder.INVALIDATE_TOKEN, invalidateToken)
}

export function* fetchMe(action) {
  try {
    yield put( girder.requestMe() )
    const me = yield call(fetchUserMeFromGirder)
    yield put( girder.receiveMe(me) )
  }
  catch(error) {
    yield put( girder.requestMe(error) )
  }
}

export function* watchFetchMe() {
  yield takeEvery(girder.LOAD_ME, fetchMe)
}

export function* receiveNotification(action) {
  const data = action.payload.data;
  const type = action.payload.type;
  if (type === 'taskflow.status') {
    const _id = data._id;
    const taskflow = yield select(selectors.cumulus.getTaskFlow, _id)

    if (taskflow) {
      // If we have a status then we are keep track of this taskflow
      yield put (cumulus.receiveTaskFlowStatus(data))
    }
  }
  else if (type === 'job.status') {
    const id = data._id;
    const job = yield select(selectors.cumulus.getJob, id)

    if (job) {
      // If we have a status then we are keep track of this taskflow
      yield put(cumulus.receiveJobStatus(data))
    }
    // This is a new job
    else if (data.status === 'created') {
      yield put(cumulus.loadJob({id}));
    }
  }
}

export function* watchNotification() {
  yield takeEvery(girder.RECEIVE_NOTIFICATION, receiveNotification)
}

// TaskFlow

export function fetchTaskFlowFromGirder(id) {
  return girderClient().get(`taskflows/${id}`)
          .then(response => response.data )
}

export function* fetchTaskFlow(action) {
  try {
    const authenticating = yield select(selectors.girder.isAuthenticating);

    // If we are authenticating then wait ...
    if (authenticating) {
      yield take(girder.AUTHENTICATED);
    }

    const _id = action.payload.id;
    yield put( cumulus.requestTaskFlow(_id) );
    let taskflow = yield call(fetchTaskFlowFromGirder, _id);
    // See if we have any jobs associated with the taskflow and if so load
    // them.
    let jobs = jp.query(taskflow, '$.meta.jobs');
    console.log(jobs);
    if (jobs.length === 1) {
      jobs = jobs[0];

      for( let job of jobs) {
        const id = job._id;
        console.log(id);
        yield put( cumulus.loadJob({id}));
      }
    }

    yield put( cumulus.receiveTaskFlow({taskflow}));
  }
  catch(error) {
    console.log(error);
    yield put( cumulus.requestTaskFlow(error) )
  }
}

export function* watchFetchTaskFlow() {
  yield takeEvery(cumulus.LOAD_TASKFLOW, fetchTaskFlow)
}

// Job

export function fetchJobFromGirder(id) {
  return girderClient().get(`jobs/${id}`)
          .then(response => response.data )
}

export function* fetchJob(action) {
  try {
    const _id = action.payload.id;
    yield put( cumulus.requestJob(_id) );
    let job = yield call(fetchJobFromGirder, _id);
    yield put( cumulus.receiveJob({job}));
  }
  catch(error) {
    yield put( cumulus.requestJob(error) )
  }
}

export function* watchFetchJob() {
  yield takeEvery(cumulus.LOAD_JOB, fetchJob)
}

// api key

export function tokenForApiKey(apiKey) {
  const params = {
      key: apiKey,
  }
  return girderClient().post('api_key/token')
          .then(response => response.data, {params})
}

export function* authenticateUsingApiKey(action) {
  try {
    const key = action.payload.key;
    yield put( girder.requestTokenForApiKey(key) );
    let tokenResponse = yield call(tokenForApiKey, key);

    yield put( girder.newToken(tokenResponse.token) );
  }
  catch(error) {
    yield put( girder.requestTokenForApiKey(error) )
  }
}

export function* watchFetchTokenForApiKey() {
  yield takeEvery( girder.FETCH_TOKEN_FOR_API_KEY, authenticateUsingApiKey)
}

export default function* root() {
  yield fork(watchFetchMolecules)
  yield fork(watchFetchMolecule)
  yield fork(watchFetchMoleculeById)
  yield fork(watchFetchCalculationById)
  yield fork(watchFetchOrbital)
  yield fork(watchFetchOauthProviders)
  yield fork(watchInvalidateToken)
  yield fork(watchNewToken)
  yield fork(watchAuthenticate)
  yield fork(watchFetchMe)
  yield fork(watchNotification)
  yield fork(watchFetchTaskFlow)
  yield fork(watchFetchJob)
  yield fork(watchFetchTokenForApiKey)
  yield fork(watchNotifications)
  yield fork(watchAuthenticateNersc)
  yield fork(watchLoadNotebooks)
  yield fork(watchRedirectToJupyterHub)
  yield fork(watchTestOauthEnabled)
  yield fork(watchInvalidateSession)
  yield fork(watchLoadCalculationNotebooks)
  yield fork(watchLoginGirder)
}

