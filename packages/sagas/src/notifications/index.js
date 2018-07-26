import { take, put, call, fork } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import has from 'lodash-es'

import { girder } from '@openchemistry/redux';

function createEventSource() {
  return eventChannel(emit => {
    const origin = window.location.origin;
    const eventSource = new EventSource(`${origin}/api/v1/notification/stream`);
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
    if (_.has(payload, 'error')) {
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

    if (!_.isNil(eventSourceChannel)) {
      eventSourceChannel.close()
    }

    eventSourceChannel = yield call(createEventSource)

    yield fork(receiveEvents, eventSourceChannel);
  }
}
