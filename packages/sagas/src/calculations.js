import { select, put, call, all, takeEvery} from 'redux-saga/effects'
import { isNil } from 'lodash-es'

import { file } from '@openchemistry/rest'
import {
  calculations as calculationsRedux,
  molecules as moleculesRedux
} from '@openchemistry/redux'
import { selectors } from '@openchemistry/redux';

import girderClient from '@openchemistry/girder-client';

import { setPaginationDefaults } from './index'

function fetchCalculations(options={}) {
  // Let's modify a clone of the options instead of the original options
  const optionsClone = { ...options };
  setPaginationDefaults(optionsClone);
  const params = { params: optionsClone };
  return girderClient().get('calculations', params)
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
    const {options, loadMolecules} = action.payload
    const res = yield call(fetchCalculations, options);
    const calculations = res.results;
    const matches = res.matches;
    yield put(calculationsRedux.receiveCalculations({calculations, matches}));
    if (loadMolecules) {
      const moleculeIds = new Set();
      calculations.forEach(calc => {
        moleculeIds.add(calc.moleculeId);
      });
      for (let _id of moleculeIds) {
        yield put(moleculesRedux.loadMoleculeById(_id));
      }
    }
  } catch(error) {
    yield put(calculationsRedux.requestCalculations(error))
  }
}

export function* watchLoadCalculations() {
  yield takeEvery(calculationsRedux.LOAD_CALCULATIONS, loadCalculations);
}
