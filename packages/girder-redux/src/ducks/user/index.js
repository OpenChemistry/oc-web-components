import { createAction, handleActions } from 'redux-actions';

// State
const initialState = {
  userInfo : {},
  twitterId: '',
  orcidId: '',
  apiKeysById: {},
  showApiForm: false,
};

// Selectors
let getRoot = (state) => state;
export const createRoot = (getRootFn) => {getRoot = getRootFn;};
export const getUserData = (state) => getRoot(state).user.userInfo;
export const getTwitterId = (state) => getRoot(state).user.twitterId;
export const getOrcidId = (state) => getRoot(state).user.orcidId;
export const getApiKeys = (state) => getRoot(state).user.apiKeysById;

//Actions
const FETCH_USER_REQUESTED = 'FETCH_USER_REQUESTED';
const FETCH_USER_SUCCEEDED = 'FETCH_USER_SUCCEEDED';
const FETCH_USER_FAILED = 'FETCH_USER_FAILED';

const UPDATE_USER_REQUESTED = 'UPDATE_USER_REQUESTED';
const UPDATE_USER_FAILED = 'UPDATE_USER_FAILED';

const TWITTER_LOGIN_REQUESTED = 'TWITTER_LOGIN_REQUESTED'
const TWITTER_SUCCESS = 'TWITTER_SUCCESS'
const TWITTER_LOGIN_FAILED = 'TWITTER_LOGIN_FAILED'
const TWITTER_ID_REQUESTED = 'TWITTER_ID_REQUESTED'

const ORCID_LOGIN_REQUESTED = 'ORCID_LOGIN_REQUESTED'
const ORCID_SUCCESS = 'ORCID_SUCCESS'
const ORCID_LOGIN_FAILED = 'ORCID_LOGIN_FAILED'
const ORCID_ID_REQUESTED = 'ORCID_ID_REQUESTED'

const API_KEY_REQUESTED = 'API_KEY_REQUESTED'
const API_KEY_RECEIVED = 'API_KEY_RECEIVED'
const API_KEY_FAILED = 'API_KEY_FAILED'
const CREATE_API_KEY = 'CREATE_API_KEY'
const EDIT_API_KEY = 'EDIT_API_KEY'
const DELETE_API_KEY = 'DELETE_API_KEY'


//Action Creators
export const fetchUserData = createAction(FETCH_USER_REQUESTED);
export const userDataReceived = createAction(FETCH_USER_SUCCEEDED);
export const fetchUserDataFailed = createAction(FETCH_USER_FAILED);

export const updateUserInformation = createAction(UPDATE_USER_REQUESTED);
export const userUpdateFailed = createAction(UPDATE_USER_FAILED);

export const linkToTwitter = createAction(TWITTER_LOGIN_REQUESTED);
export const twitterLinked = createAction(TWITTER_SUCCESS);
export const linkToTwitterFailed = createAction(TWITTER_LOGIN_FAILED);
export const retrieveTwitterId = createAction(TWITTER_ID_REQUESTED);

export const linkToOrcid = createAction(ORCID_LOGIN_REQUESTED);
export const orcidLinked = createAction(ORCID_SUCCESS);
export const linkToOrcidFailed = createAction(ORCID_LOGIN_FAILED);
export const retrieveOrcidId = createAction(ORCID_ID_REQUESTED);

export const requestApiKeys = createAction(API_KEY_REQUESTED);
export const receiveApiKeys = createAction(API_KEY_RECEIVED);
export const apiKeyFailed = createAction(API_KEY_FAILED);
export const createApiKey = createAction(CREATE_API_KEY);
export const editApiKey = createAction(EDIT_API_KEY);
export const deleteApiKey = createAction(DELETE_API_KEY);

//Reducer
const reducer = handleActions({
  [FETCH_USER_SUCCEEDED] : (state, action) => {
    const { info, tId, oId } = action.payload;
    return {...state, userInfo: info, twitterId: tId, orcidId: oId};
  },
  [TWITTER_SUCCESS] : (state, action) => {
    const id = action.payload;
    return {...state, twitterId: id};
  },
  [ORCID_SUCCESS] : (state, action) => {
    const id = action.payload;
    return {...state, orcidId: id};
  },
  [API_KEY_RECEIVED] : (state, action) => {
    const keys = action.payload;
    const value = keys.reduce((results, key) => {
      results[key._id] = key;
      return results;
    }, {});
    return {...state, apiKeysById : value};
  },
}, initialState);

export default reducer;