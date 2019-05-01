import { select, put, call, all, takeEvery} from 'redux-saga/effects'
import { isNil } from 'lodash-es'

import { file } from '@openchemistry/rest'
import { calculations as calculationsRedux } from '@openchemistry/redux'
import { selectors } from '@openchemistry/redux';

import girderClient from '@openchemistry/girder-client';

function fetchCalculations(moleculeId) {
  return girderClient().get('calculations', {params: {moleculeId}})
          .then(response => response.data )
}

export function* loadCalculationNotebooks(action) {
  try {
    const { calculationId } = action.payload;
    yield put(calculationsRedux.requestCalculationNotebooks(calculationId));

    const calculations = yield select(selectors.calculations.getCalculationsById);
    const calculation = calculations[calculationId];
    const notebooks = calculation.notebooks;

    if (isNil(notebooks)) {
      put(calculationsRedux.receiveCalculationNotebooks(calculationId, []));
      return;
    }

    const calls = []
    for (const notebook of notebooks) {
      calls.push(call(file.get, notebook));
    }

    const files = yield all(calls);

    yield put(calculationsRedux.receiveCalculationNotebooks(calculationId, files));
  }
  catch(error) {
    yield put(calculationsRedux.requestCalculationNotebooks(error));
  }
}

export function* watchLoadCalculationNotebooks() {
  yield takeEvery(calculationsRedux.LOAD_CALCULATION_NOTEBOOKS, loadCalculationNotebooks);
}

function* loadCalculations(action) {
  try {
    const { moleculeId } = action.payload || {};
    const calculations = yield call(fetchCalculations, moleculeId);
    yield put(calculationsRedux.receiveCalculations({calculations}));
  } catch(error) {
    yield put(calculationsRedux.requestCalculations(error))
  }
}

export function* watchLoadCalculations() {
  yield takeEvery(calculationsRedux.LOAD_CALCULATIONS, loadCalculations);
}
