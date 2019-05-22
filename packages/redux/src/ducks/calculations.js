import { createAction, handleActions } from 'redux-actions';

// Actions
export const LOAD_CALCULATIONS = 'LOAD_CALCULATIONS';
export const REQUEST_CALCULATIONS = 'REQUEST_CALCULATIONS';
export const RECEIVE_CALCULATIONS = 'RECEIVE_CALCULATIONS';

export const LOAD_CALCULATION_BY_ID  = 'LOAD_CALCULATION_BY_ID';
export const REQUEST_CALCULATION_BY_ID = 'REQUEST_CALCULATION_BY_ID';
export const RECEIVE_CALCULATION   = 'RECEIVE_CALCULATION';

export const LOAD_ORBITAL   = 'LOAD_ORBITAL';
export const REQUEST_ORBITAL = 'REQUEST_ORBITAL';
export const RECEIVE_ORBITAL   = 'RECEIVE_ORBITAL';

export const LOAD_CALCULATION_NOTEBOOKS   = 'LOAD_CALCULATION_NOTEBOOKS';
export const REQUEST_CALCULATION_NOTEBOOKS   = 'REQUEST_CALCULATION_NOTEBOOKS';
export const RECEIVE_CALCULATION_NOTEBOOKS   = 'RECEIVE_CALCULATION_NOTEBOOKS';


const initialState = {
  byId: {},
  matches: 0,
  orbitalsById: {},
  noteBooksById: {},
  error: null,
};

// Reducer
const reducer = handleActions({
  REQUEST_CALCULATION_BY_ID: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    else {
      return {...state,  error:null };
    }
  },
  RECEIVE_CALCULATION: (state, action) => {
    const calculation = action.payload.calculation;
    const byId = {...state.byId, [calculation._id]: calculation };
    return {...state, byId};
  },
  REQUEST_ORBITAL: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    else {
      return {...state,  error:null };
    }
  },
  RECEIVE_ORBITAL: (state, action) => {
    const id = action.payload.id;
    const mo = action.payload.mo;
    const orbital = action.payload.orbital;

    let orbitals = state.orbitalsById.id || {}
    orbitals = {...orbitals, [mo]: orbital};

    const orbitalsById = {...state.orbitalsById, [id]: orbitals };
    return {...state, orbitalsById};
  },
  REQUEST_CALCULATION_NOTEBOOKS: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    else {
      return {...state,  error:null };
    }
  },
  RECEIVE_CALCULATION_NOTEBOOKS: (state, action) => {
    const {calculationId, notebooks} = action.payload;
    const noteBooksById = {...state.noteBooksById, [calculationId]: notebooks };
    return {...state,  noteBooksById};
  },
  REQUEST_CALCULATIONS: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    else {
      return initialState;
    }
  },
  RECEIVE_CALCULATIONS: (state, action) => {
    const {calculations, matches} = action.payload;
    let byId = {};
    byId = calculations.reduce((result, item) => {
      result[item._id] = item;
      return result;
    }, byId);
    return {...state, byId, matches};
  }
}, initialState);

// Action Creators

// Fetch calculations
export const loadCalculations = createAction(LOAD_CALCULATIONS);
export const requestCalculations = createAction(REQUEST_CALCULATIONS);
export const receiveCalculations = createAction(RECEIVE_CALCULATIONS);

// Fetch calculation
export const loadCalculationById = createAction(LOAD_CALCULATION_BY_ID, (id) => ({ id }));
export const requestCalculationById = createAction(REQUEST_CALCULATION_BY_ID, (id) => ({ id }));
export const receiveCalculation = createAction(RECEIVE_CALCULATION, (calculation) => ({ calculation }));

//Fetch orbitals
export const loadOrbital = createAction(LOAD_ORBITAL, (id, mo) => ({ id, mo }));
export const requestOrbital = createAction(REQUEST_ORBITAL, (id, mo) => ({ id, mo }));
export const receiveOrbital = createAction(RECEIVE_ORBITAL, (id, mo, orbital) => ({ id, mo, orbital }));

export const loadCalculationNotebooks = createAction(LOAD_CALCULATION_NOTEBOOKS, (calculationId) => ({calculationId}));
export const requestCalculationNotebooks = createAction(REQUEST_CALCULATION_NOTEBOOKS);
export const receiveCalculationNotebooks = createAction(RECEIVE_CALCULATION_NOTEBOOKS, (calculationId, notebooks) => ({ calculationId, notebooks }));

export default reducer;
