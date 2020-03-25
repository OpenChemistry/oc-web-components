import { put, call, takeEvery } from 'redux-saga/effects'

import girderClient from '@openchemistry/girder-client';
import { images } from '@openchemistry/redux'

export function getUniqueImages() {
  return girderClient().get('images/unique').then(r => r.data);
}

export function* requestUniqueImages(action) {
  try {
    const results = yield call(getUniqueImages);
    yield put(images.receiveUniqueImages(results));
  }
  catch(error) {
    console.log('Error requesting unique images: ', error);
  }
}

export function* watchRequestUniqueImages() {
  yield takeEvery(images.REQUEST_UNIQUE_IMAGES, requestUniqueImages)
}
