import { Enum } from 'enumify';
import { hasIn } from 'lodash-es'

export const getTaskFlow = (state, _id) => _id in state.cumulus.taskflows.byId ?  state.cumulus.taskflows.byId[_id] : null;
export const isTaskFlowObserved = (state, _id) => state.cumulus.taskflows.observed.has(_id);

export const getTaskFlowStatus = (state, _id) => {
  const taskflow = getTaskFlow(state, _id);
  if (taskflow) {
    return taskflow.status;
  }

  return null;
}

export const getJob = (state, _id) => _id in state.cumulus.jobs.byId ?  state.cumulus.jobs.byId[_id] : null;

export const getTaskFlowJobIds = (state, _id) => _id in state.cumulus.taskflows.idToJobIds ? state.cumulus.taskflows.idToJobIds[_id] : null;

class TaskFlowState  extends Enum {}
TaskFlowState.initEnum(['created', 'running', 'error',
                        'unexpectederror', 'terminating', 'terminated',
                        'deleting', 'deleted', 'complete']);

class JobState extends Enum {}
JobState.initEnum(['created', 'running', 'terminated', 'terminating',
                   'unexpectederror', 'queued', 'error', 'complete']);

class CalculationState extends Enum {}
CalculationState.initEnum(['initializing', 'queued', 'running', 'terminated',
                  'terminating', 'unexpectederror', 'error', 'complete',
                  'uploading']);

export const getCalculationStatus = (state, taskFlowId) => {

  const taskFlow = getTaskFlow(state, taskFlowId);
  if (!taskFlow) {
    return null;
  }

  // TaskFlow is 'running'
  if (taskFlow.status === TaskFlowState.running.name) {
    const jobIds = getTaskFlowJobIds(state, taskFlowId);
    if (!jobIds) {
      return CalculationState.initializing.name;
    }
    else {
      // For now we should only have one.
      const jobId = jobIds[0];
      const job = getJob(state, jobId);
      if (!job) {
        return CalculationState.initializing.name;
      } else if (job.status === JobState.created.name) {
        return CalculationState.initializing.name;
      }
      else if (job.status !== JobState.complete.name) {
        return job.status;
      }
      else {
        return CalculationState.uploading.name;
      }
    }
  }
  else {
    return taskFlow.status;
  }
}

export const getCalculationCode = (state, taskFlowId) => {

  const taskFlow = getTaskFlow(state, taskFlowId);
  if (!taskFlow) {
    return null;
  }

  // Code name and version are only known after
  // the container description has been obtained
  if (hasIn(taskFlow, 'meta.code')) {
    return {
      name: taskFlow['meta']['code']['name'],
      version: taskFlow['meta']['code']['version']
    }
  }

  // Before that, just return the repository name of the container
  if (hasIn(taskFlow, 'meta.image.repository')) {
    return {
      name: taskFlow['meta']['image']['repository'],
      version: null
    }
  }

  return null;
}

export const getCalculationType = (state, taskFlowId) => {

  const taskFlow = getTaskFlow(state, taskFlowId);
  if (!taskFlow) {
    return null;
  }

  if (hasIn(taskFlow, 'meta.type')) {
    return taskFlow['meta']['type']
  }

  return null;
}
