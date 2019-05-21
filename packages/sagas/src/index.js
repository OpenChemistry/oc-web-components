import axios from 'axios';
import { has } from 'lodash-es'
import { put, call, takeEvery, take, select } from 'redux-saga/effects'

import { molecules } from '@openchemistry/redux';
import { calculations } from '@openchemistry/redux';
import { girder } from '@openchemistry/redux';
import { cumulus } from '@openchemistry/redux';
import { selectors } from '@openchemistry/redux';
import { auth } from '@openchemistry/girder-redux';

import { watchNotifications, watchNewToken } from './notifications'
export { watchNotifications, watchNewToken };
import { watchLoadNotebooks } from './app'
export { watchLoadNotebooks };
import { watchRedirectToJupyterHub, watchInvalidateSession, watchInvalidateToken } from './jupyterlab'
export { watchRedirectToJupyterHub, watchInvalidateSession, watchInvalidateToken}

import girderClient from '@openchemistry/girder-client';
import { watchLoadCalculationNotebooks, watchLoadCalculations } from './calculations'
export { watchLoadCalculationNotebooks, watchLoadCalculations }
import { watchLoadConfiguration } from './configuration'
export { watchLoadConfiguration }

import jp from 'jsonpath';

// var jp = require('jsonpath')

function setPaginationDefaults(options)
{
  const defaults = { limit: 25, offset: 0, sort: '_id', sortdir: -1 }
  for (const key in defaults) {
    if (!has(options, key)) {
      options[key] = defaults[key]
    }
  }
}

export function fetchMoleculesFromGirder(options={}) {
  // Let's modify a clone of the options instead of the original options
  const optionsClone = { ...options }
  setPaginationDefaults(optionsClone)
  const params = { params: optionsClone }
  return girderClient().get('molecules', params)
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

// Molecules

export function* fetchMolecules(action) {
  const options = action.payload
  try {
    yield put( molecules.requestMolecules() )
    const res = yield call(fetchMoleculesFromGirder, options)
    const newMolecules = res.results
    yield put( molecules.receiveMolecules(newMolecules) )
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

    // If we are monitoring the logs of of the taskflow associated with the job, we may want to refresh the taskflow as well
    let refreshTaskFlow = false;
    let taskFlowId = '';

    const getTaskFlowId = (job) => {
      let taskFlowId = jp.query(job, '$.params.taskFlowId');
      if (taskFlowId.length === 1) {
        return taskFlowId[0];
      }
      return '';
    }

    if (job) {
      // If we have a status then we are keep track of this taskflow
      yield put(cumulus.receiveJobStatus(data));
      taskFlowId = getTaskFlowId(job);
      if (taskFlowId) {
        refreshTaskFlow = yield select(selectors.cumulus.isTaskFlowObserved, taskFlowId);
      }
    }
    // This is a new job
    else {
      let job = yield call(fetchJobFromGirder, id);
      yield put(cumulus.receiveJob({job}));
      taskFlowId = getTaskFlowId(job);
      if (taskFlowId) {
        const taskflow = yield select(selectors.cumulus.getTaskFlow, taskFlowId);
        if (taskflow) {
          refreshTaskFlow = true;
        }
      }
    }

    if (refreshTaskFlow) {
      yield put(cumulus.loadTaskFlow({id: taskFlowId}));
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
    const authenticating = yield select(auth.selectors.isAuthenticating);

    // If we are authenticating then wait ...
    if (authenticating) {
      yield take(auth.actions.setToken.toString());
    }

    const _id = action.payload.id;
    yield put( cumulus.requestTaskFlow(_id) );
    let taskflow = yield call(fetchTaskFlowFromGirder, _id);
    // See if we have any jobs associated with the taskflow and if so load
    // them.
    let jobs = jp.query(taskflow, '$.meta.jobs');
    if (jobs.length === 1) {
      jobs = jobs[0];

      for( let job of jobs) {
        const id = job._id;
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
