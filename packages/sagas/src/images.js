import { put, call, takeEvery } from 'redux-saga/effects'

import girderClient from '@openchemistry/girder-client';
import { images } from '@openchemistry/redux'

export function getUniqueImages() {
  const params = {params: {unique: true}};
  return girderClient().get('images', params).then(r => r.data);
}

export function* requestUniqueImages(action) {
  try {
    const results = yield call(getUniqueImages);
    yield put(images.receiveUniqueImages(results));
  }
  catch(error) {
    yield put(images.requestUniqueImages(error));
  }
}

export function* watchRequestUniqueImages() {
  yield takeEvery(images.REQUEST_UNIQUE_IMAGES, requestUniqueImages)
}

export function postRegisterImages() {
  return girderClient().post('images/register').then(r => r.data);
}

export function* registerImages(action) {
  try {
    const results = yield call(postRegisterImages);
  }
  catch(error) {
    yield put(images.registerImages(error));
  }
}

export function* watchRegisterImages() {
  yield takeEvery(images.REGISTER_IMAGES, registerImages);
}
