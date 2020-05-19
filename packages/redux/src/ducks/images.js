import { createAction, handleActions } from 'redux-actions';

// Actions
export const REQUEST_UNIQUE_IMAGES = 'REQUEST_UNIQUE_IMAGES';
export const RECEIVE_UNIQUE_IMAGES = 'RECEIVE_UNIQUE_IMAGES';

export const REGISTER_IMAGES = 'REGISTER_IMAGES';

// Action Creators
export const requestUniqueImages = createAction(REQUEST_UNIQUE_IMAGES);
export const receiveUniqueImages = createAction(RECEIVE_UNIQUE_IMAGES, (results) => ({ results }));

export const registerImages = createAction(REGISTER_IMAGES);

const initialState = {
    results: [],
    matches: 0,
    error: null,
  };

// Reducer
const reducer = handleActions({
  REQUEST_UNIQUE_IMAGES: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    return {...state, error: null};
  },
  RECEIVE_UNIQUE_IMAGES: (state, action) => {
    const { matches, results } = action.payload.results;
    return {...state, matches, results, error: null};
  },
  REGISTER_IMAGES: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    return { ...state };
  },
}, initialState);

export default reducer;
