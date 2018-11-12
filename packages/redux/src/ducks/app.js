import { createAction, handleActions } from 'redux-actions';

// Actions
export const SELECT_MOLECULE = 'SELECT_MOLECULE';

export const LOAD_NOTEBOOKS   = 'LOAD_NOTEBOOKS';
export const REQUEST_NOTEBOOKS   = 'REQUEST_NOTEBOOKS';
export const RECEIVE_NOTEBOOKS   = 'RECEIVE_NOTEBOOKS';

export const REQUEST_OC_FOLDER = 'REQUEST_OC_FOLDER';
export const RECEIVE_OC_FOLDER = 'RECEIVE_OC_FOLDER';


const initialState = {
  selectedMoleculeId: null,
  notebooks: []
};

// Reducer
const reducer = handleActions({
  SELECT_MOLECULE: (state, action) => {
    const selectedMoleculeId = action.payload.id;
    return {...state, selectedMoleculeId };
  },
  REQUEST_NOTEBOOKS: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    else {
      return {...state,  error:null };
    }
  },
  RECEIVE_NOTEBOOKS: (state, action) => {
    const notebooks = action.payload.notebooks;
    return {...state,  notebooks };
  },
  REQUEST_OC_FOLDER: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    else {
      return {...state,  error:null };
    }
  },
  RECEIVE_OC_FOLDER: (state, action) => {
    const ocFolder = action.payload.folder;


    return {...state,  ocFolder };
  },
  throw: (state, action) => state
}, initialState);

// Action Creators
export const selectMolecule = createAction(SELECT_MOLECULE, (id) => ({id}));

export const loadNotebooks = createAction(LOAD_NOTEBOOKS);
export const requestNotebooks = createAction(REQUEST_NOTEBOOKS);
export const receiveNotebooks = createAction(RECEIVE_NOTEBOOKS, (notebooks) => ({ notebooks }));

export const requestOcFolder = createAction(REQUEST_OC_FOLDER);
export const receiveOcFolder = createAction(RECEIVE_OC_FOLDER, (folder) =>({folder}));

export default reducer;
