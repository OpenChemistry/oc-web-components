import { take, put, call, fork, takeEvery } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import {has, isNil} from 'lodash-es'

import girderClient from '@openchemistry/girder-client'

import {
  connectToNotifications,
  receiveNotification,
  eventSourceError
} from '../../ducks/notifications';
import { setToken } from '../../ducks/auth';


function createEventSource() {
  return eventChannel(emit => {
    const baseURL = girderClient().getBaseURL();
    const eventSource = new EventSource(`${baseURL}/notification/stream`);
    eventSource.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      emit(msg);
    };

    eventSource.onerror = (e) => {
      emit({
        error: e
      });
    };

    const close = () => {
      eventSource.close();
    };

    return close;
  })
}

function* receiveEvents(eventSourceChannel) {
  while (true) {
    const payload = yield take(eventSourceChannel)
    if (has(payload, 'error')) {
      yield put(eventSourceError(payload));
    }
    else {
      yield put(receiveNotification(payload));
    }
  }
}

export function* watchNotifications() {

  let eventSourceChannel = null;

  while (true) {
    yield take(connectToNotifications.toString())

    if (!isNil(eventSourceChannel)) {
      eventSourceChannel.close()
    }

    eventSourceChannel = yield call(createEventSource)

    yield fork(receiveEvents, eventSourceChannel);
  }
}

function* onNewToken() {
  yield put(connectToNotifications());
}

export function* watchNewToken() {
  // Connect to notification stream when a new token is set
  yield takeEvery(setToken.toString(), onNewToken);
}
