import axios from 'axios';
import { has, isNil } from 'lodash-es'
import { put, call, takeEvery, take, select } from 'redux-saga/effects'

import { molecules } from '@openchemistry/redux';
import { calculations } from '@openchemistry/redux';
import { girder } from '@openchemistry/redux';
import { cumulus } from '@openchemistry/redux';
import { selectors } from '@openchemistry/redux';
import { auth } from '@openchemistry/girder-redux';

import { watchNotifications, watchNewToken, watchAsyncOrbital } from './notifications'
export { watchNotifications, watchNewToken, watchAsyncOrbital };
import { watchLoadNotebooks } from './app'
export { watchLoadNotebooks };
import { watchRedirectToJupyterHub, watchInvalidateSession, watchInvalidateToken } from './jupyterlab'
export { watchRedirectToJupyterHub, watchInvalidateSession, watchInvalidateToken}

import girderClient from '@openchemistry/girder-client';
import { watchLoadCalculationNotebooks, watchLoadCalculations, watchCreateCalculation } from './calculations'
export { watchLoadCalculationNotebooks, watchLoadCalculations, watchCreateCalculation }
import { watchLoadConfiguration } from './configuration'
export { watchLoadConfiguration }

import jp from 'jsonpath';

// var jp = require('jsonpath')

export function setPaginationDefaults(options)
{
  const defaults = { limit: 25, offset: 0, sort: '_id', sortdir: -1 }
  for (const key in defaults) {
    if (!has(options, key)) {
      options[key] = defaults[key]
    }
  }
}

export function parseImageName(name) {
  // This returns an image object
  // If the tag is undefined, it will be set to 'latest'

  const split = name.split(':');
  const repository = split[0];
  let tag = split[1];

  if (isNil(tag)) {
    tag = 'latest';
  }

  return {
    repository,
    tag
  };
}

export function fetchClusters() {
  return girderClient().get('clusters').then(r => r.data);
}

export function* makeClusterObject(clusterId) {
  if (!isNil(clusterId)) {
    return {
      _id: clusterId
    }
  }

  // Check to see if we are on nersc
  if (process.env.OC_SITE == 'NERSC') {
    return {
      name: 'cori'
    }
  }

  // Grab the first cluster we can find
  const clusters = yield call(fetchClusters);
  if (clusters.length > 0) {
    return {
      _id: clusters[0]['_id']
    }
  }

  // The object will be undefined if we reach here...
}

export function fetchMoleculesFromGirder(options={}, creatorId) {
  // Let's modify a clone of the options instead of the original options
  const optionsClone = { ...options }
  setPaginationDefaults(optionsClone)

  var params = { params: optionsClone }
  if (!isNil(creatorId)){
    params = { params: {...optionsClone, creatorId} }
  }

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

export function fetchCreatorFromGirder(id) {
  return girderClient().get(`user/${id}`)
    .then(response => response.data)
}

export function fetchTwitterId(id) {
  return girderClient().get(`user/${id}/twitter`)
  .then(response => response.data);
}

export function fetchOrcidId(id) {
  return girderClient().get(`user/${id}/orcid`)
  .then(response => response.data)
}

// Molecules

export function* fetchMolecules(action) {
  const { options, creatorId } = action.payload
  try {
    yield put( molecules.requestMolecules() )
    const res = yield call(fetchMoleculesFromGirder, options, creatorId)
    const newMolecules = res.results;
    const matches = res.matches;
    yield put( molecules.receiveMolecules(newMolecules, matches) )
  }
  catch(error) {
    yield put( molecules.requestMolecules(error) )
  }
}

export function* fetchMolecule(action) {
  try {
    yield put( molecules.requestMolecule(action.payload.inchikey) )
    const molecule = yield call(fetchMoleculeFromGirder, action.payload.inchikey)
    const user = yield call(fetchCreatorFromGirder, molecule.creatorId)
    const twitterId = yield call(fetchTwitterId, user._id)
    const orcidId = yield call(fetchOrcidId, user._id)
    const creator = {...user, twitterId, orcidId}
    yield put( molecules.receiveMolecule({ molecule, creator }) )
  }
  catch(error) {
    yield put( molecules.requestMolecule(error) )
  }
}

export function* fetchMoleculeById(action) {
  try {
    yield put( molecules.requestMoleculeById(action.payload.id) )
    const molecule = yield call(fetchMoleculeByIdFromGirder, action.payload.id)
    const user = yield call(fetchCreatorFromGirder, molecule.creatorId)
    const twitterId = yield call(fetchTwitterId, user._id)
    const orcidId = yield call(fetchOrcidId, user._id)
    const creator = {...user, twitterId, orcidId}
    yield put( molecules.receiveMolecule({ molecule, creator }) )
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
    const user = yield call(fetchCreatorFromGirder, calculation.creatorId)
    const twitterId = yield call(fetchTwitterId, user._id)
    const orcidId = yield call(fetchOrcidId, user._id)
    const creator = {...user, twitterId, orcidId}
    yield put( calculations.receiveCalculation({ calculation, creator }) )
  }
  catch(error) {
    yield put( calculations.requestCalculationById(error) )
  }
}

export function* watchFetchCalculationById() {
  yield takeEvery(calculations.LOAD_CALCULATION_BY_ID, fetchCalculationById)
}

// mo
export function fetchOrbitalFromGirder(id, mo, params) {
  return girderClient().get(`calculations/${id}/cube/${mo}`, {params: params})
          .then(response => response.data )
}
export function* fetchOrbital(action) {
  try {
    yield put( calculations.requestOrbital(action.payload.id, action.payload.mo) )
    const orbital = yield call(fetchOrbitalFromGirder, action.payload.id, action.payload.mo, {async: true})
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
  else if (type === 'cube.status') {
    if (has(data, 'error')) {
      console.log(data.error);
    } else {
      const orbital = yield call(fetchOrbitalFromGirder, data.id, data.mo);
      yield put( calculations.receiveOrbital(data.id, data.mo, orbital) );
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
    yield put( cumulus.requestTaskFlow(error) )
  }
}

export function* watchFetchTaskFlow() {
  yield takeEvery(cumulus.LOAD_TASKFLOW, fetchTaskFlow)
}

export function fetchQueue(params) {
  return girderClient().get('queues', params).then(r => r.data);
}

export function postQueue(params) {
  return girderClient().post('queues', {}, params).then(r => r.data);
}

export function postTaskFlow(body) {
  return girderClient().post('taskflows', body).then(r => r.data);
}

export function addTaskFlow(queueId, taskFlowId, body) {
  return girderClient().put(`queues/${queueId}/add/${taskFlowId}`, body)
          .then(r => r.data);
}

export function popQueue(queueId, params) {
  return girderClient().put(`queues/${queueId}/pop`, {}, params)
          .then(r => r.data);
}

export function* launchTaskFlow(action) {
  try {
    const { imageName, container, clusterId, taskFlowClass } = action.payload;
    const image = parseImageName(imageName);
    const cluster = yield call(makeClusterObject, clusterId);

    let params = { name: 'oc_queue' };
    const queues = yield call(fetchQueue, params);

    if (queues.length > 0) {
      var queue = queues[0];
    } else {
      params = {
        params: {
          name: 'oc_queue',
          maxRunning: 5
        }
      };
      var queue = yield call(postQueue, params);
    }

    // Create the taskflow
    let body = {
      taskFlowClass,
      meta: {
        image
      }
    };

    const taskflow = yield call(postTaskFlow, body);

    // Start the taskflow
    body = {
      image,
      container,
      cluster
    };

    const queueId = queue['_id'];
    const taskFlowId = taskflow['_id'];
    yield call(addTaskFlow, queueId, taskFlowId, body);

    params = {
      params: {
        multi: true
      }
    };

    yield call(popQueue, queueId, params);

    return taskFlowId;
  }
  catch(error) {
    console.log(error);
  }
}

export function* watchLaunchTaskFlow() {
  yield takeEvery(cumulus.LAUNCH_TASKFLOW, launchTaskFlow)
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
