import { select, put, call, takeEvery } from 'redux-saga/effects'
import { isEmpty } from 'lodash-es';

import { LOAD_NOTEBOOKS, requestNotebooks, receiveNotebooks, requestOcFolder,
  receiveOcFolder  } from '@openchemistry/redux'
import { listFiles } from './girder'
import {  girder } from '@openchemistry/rest'
import { selectors } from '@openchemistry/redux'

export function* fetchOcFolder() {

  yield put( requestOcFolder() )
  const me = yield select(selectors.girder.getMe);
  let privateFolder = yield call(girder.folder.fetch, me['_id'], 'user', 'Private');
  if (isEmpty(privateFolder)) {
    throw new Error('User doesn\'t have a Private folder.');
  }
  else {
    privateFolder = privateFolder[0];
  }

  const ocFolder = yield call(girder.folder.create,
      privateFolder['_id'], 'folder', 'oc');

  yield put( receiveOcFolder(ocFolder) )

  return ocFolder;
}


export function* loadNotebooks(action) {

  try {
    yield put(requestNotebooks());

    const ocFolder = yield fetchOcFolder();
    const notebookFolder = yield call(girder.folder.create,
        ocFolder['_id'], 'folder', 'notebooks');

    const files = yield listFiles(notebookFolder['_id']);
    yield put(receiveNotebooks(files));
  }
  catch(error) {
    yield put(requestNotebooks(error));
  }
}

export function* watchLoadNotebooks() {
  yield takeEvery(LOAD_NOTEBOOKS, loadNotebooks);
}

