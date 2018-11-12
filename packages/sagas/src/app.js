import { select, put, call, takeEvery } from 'redux-saga/effects'
import { isEmpty } from 'lodash-es';

import { app } from '@openchemistry/redux'
import { girder as girder_redux } from '@openchemistry/redux'
import { listFiles } from './girder'
import {  girder } from '@openchemistry/rest'
import { selectors } from '@openchemistry/redux'
import { auth } from '@openchemistry/girder-redux';

export function* fetchOcFolder() {

  yield put( app.requestOcFolder() )
  const me = yield select(auth.selectors.getMe);
  let privateFolder = yield call(girder.folder.fetch, me['_id'], 'user', 'Private');
  if (isEmpty(privateFolder)) {
    throw new Error('User doesn\'t have a Private folder.');
  }
  else {
    privateFolder = privateFolder[0];
  }

  const ocFolder = yield call(girder.folder.create,
      privateFolder['_id'], 'folder', 'oc');

  yield put( app.receiveOcFolder(ocFolder) )

  return ocFolder;
}


export function* loadNotebooks(action) {

  try {
    yield put(app.requestNotebooks());

    const ocFolder = yield fetchOcFolder();
    const notebookFolder = yield call(girder.folder.create,
        ocFolder['_id'], 'folder', 'notebooks');

    const files = yield listFiles(notebookFolder['_id']);
    yield put(app.receiveNotebooks(files));
  }
  catch(error) {
    yield put(app.requestNotebooks(error));
  }
}

export function* watchLoadNotebooks() {
  yield takeEvery(app.LOAD_NOTEBOOKS, loadNotebooks);
}
