import { createAction, handleActions } from 'redux-actions';

// Actions
export const LOAD_CONFIGURATION = 'LOAD_CONFIGURATION';
export const REQUEST_CONFIGURATION = 'REQUEST_CONFIGURATION';
export const RECEIVE_CONFIGURATION = 'RECEIVE_CONFIGURATION';

const initialState = {
  configuration: null,
  error: null,
};

// Reducer
const reducer = handleActions({
  REQUEST_CONFIGURATION: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    else {
      return {...state,  error:null };
    }
  },
  RECEIVE_CONFIGURATION: (state, action) => {
    const configuration = action.payload;
    return {...state, configuration};
  }
}, initialState);

// Action Creators

// Fetch configuration
export const loadConfiguration = createAction(LOAD_CONFIGURATION);
export const requestConfiguration = createAction(REQUEST_CONFIGURATION);
export const receiveConfiguration = createAction(RECEIVE_CONFIGURATION);

export default reducer;
