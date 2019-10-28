import { take, put, call, fork, takeEvery } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import {has, isNil} from 'lodash-es'

import { girder } from '@openchemistry/redux';
import { auth } from '@openchemistry/girder-redux';
import { calculations } from '@openchemistry/redux';

import girderClient from '@openchemistry/girder-client';

function createEventSource() {
  return eventChannel(emit => {
    const origin = window.location.origin;
    const eventSource = new EventSource(`${origin}/api/v1/notification/stream`);
    console.log('EventSource: ', eventSource)
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
      yield put(girder.eventSourceError(payload));
    }
    else {
      yield put(girder.receiveNotification(payload));
    }
  }
}

export function* watchNotifications() {

  let eventSourceChannel = null;

  while (true) {
    yield take(girder.CONNECT_TO_NOTIFICATIONS)

    if (!isNil(eventSourceChannel)) {
      eventSourceChannel.close()
    }

    eventSourceChannel = yield call(createEventSource)

    yield fork(receiveEvents, eventSourceChannel);
  }
}

function* onNewToken() {
  yield put(girder.connectToNotifications());
}

export function* watchNewToken() {
  // Connect to notification stream when a new token is set
  yield takeEvery(auth.actions.setToken.toString(), onNewToken);
}

function* onAsyncOrbital() {
  console.log('onAsyncOrbital')
  yield put(girder.connectToNotifications());
}

export function* watchAsyncOrbital() {
  // Connect to notification stream when an orbital is requested
  console.log('watchAsyncOrbital')
  yield takeEvery(calculations.requestOrbital, onAsyncOrbital);
}
