import { select, put, call, all, takeEvery} from 'redux-saga/effects'
import { isNil } from 'lodash-es'

import { file } from '@openchemistry/rest'
import { configuration as configurationRedux } from '@openchemistry/redux'
import { selectors } from '@openchemistry/redux';

import { configuration } from '@openchemistry/rest'


export function* loadConfiguration(action) {
  try {
    yield put(configurationRedux.requestConfiguration());
    const conf = yield call(configuration.get);
    yield put(configurationRedux.receiveConfiguration(conf));
  }
  catch(error) {
    yield put(configurationRedux.requestConfiguration(error));
  }
}

export function* watchLoadConfiguration() {
  yield takeEvery(configurationRedux.LOAD_CONFIGURATION, loadConfiguration);
}
