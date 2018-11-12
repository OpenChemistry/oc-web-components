import { createAction } from 'redux-actions';

const PREFIX = '@@girder-redux/auth/';

const initialState = {
  token: null,
  oauth: {
    providers: {},
    enabled: false,
  },
  me: null,
  authenticating: false,
  error: null,
  ui: {
    showLoginOptions: false,
    girder: {
      show: false
    },
    nersc: {
      show: false
    }
  }
};

// Selectors
let getRoot = (state) => state;
export const setRoot = (getRootFn) => {getRoot = getRootFn;};
export const getMe = (state) => getRoot(state).me;
export const getToken = (state) => getRoot(state).token;
export const getOauthProviders = (state) => getRoot(state).oauth.providers;
export const isAuthenticating = (state) => getRoot(state).authenticating;
export const isAuthenticated = (state) => getRoot(state).token && !getRoot(state).authenticating;
export const isOauthEnabled = (state) => getRoot(state).oauth.enabled;
export const getShowLoginOptions = (state) => getRoot(state).ui.showLoginOptions;
export const getShowGirderLogin = (state) => getRoot(state).ui.girder.show;
export const getShowNerscLogin = (state) => getRoot(state).ui.nersc.show;

// Actions

export const AUTHENTICATE = PREFIX + 'AUTHENTICATE';

export const SET_TOKEN = PREFIX + 'SET_TOKEN';
export const SET_AUTHENTICATING = PREFIX + 'SET_AUTHENTICATING';
export const SET_ME = PREFIX + 'SET_ME';

export const INVALIDATE_TOKEN = PREFIX + 'INVALIDATE_TOKEN';
export const REQUEST_INVALIDATE_TOKEN = PREFIX + 'REQUEST_INVALIDATE_TOKEN';

export const USERNAME_LOGIN = PREFIX + 'USERNAME_LOGIN';
export const NERSC_LOGIN = PREFIX + 'NERSC_LOGIN';

export const LOAD_ME = PREFIX + 'LOAD_ME';
export const REQUEST_ME = PREFIX + 'REQUEST_ME';

export const LOAD_OAUTH_PROVIDERS = PREFIX + 'LOAD_OAUTH_PROVIDERS';
export const REQUEST_OAUTH_PROVIDERS = PREFIX + 'REQUEST_OAUTH_PROVIDERS';
export const RECEIVE_OAUTH_PROVIDERS = PREFIX + 'RECEIVE_OAUTH_PROVIDERS';

export const TEST_OAUTH_ENABLED = PREFIX + 'TEST_OAUTH_ENABLED';
export const SET_OAUTH_ENABLED = PREFIX + 'SET_OAUTH_ENABLED';

export const SHOW_LOGIN_OPTIONS = PREFIX + 'SHOW_LOGIN_OPTIONS';
export const SHOW_GIRDER_LOGIN = PREFIX + 'SHOW_GIRDER_LOGIN';
export const SHOW_NERSC_LOGIN = PREFIX + 'SHOW_NERSC_LOGIN';

export const LOAD_TOKEN_FROM_API_KEY = "LOAD_TOKEN_FROM_API_KEY"
export const REQUEST_TOKEN_FROM_API_KEY = "REQUEST_TOKEN_FROM_API_KEY"

// Action creators
export const authenticate = createAction(AUTHENTICATE);
export const setAuthenticating = createAction(SET_AUTHENTICATING);

export const invalidateToken = createAction(INVALIDATE_TOKEN);
export const requestInvalidateToken = createAction(REQUEST_INVALIDATE_TOKEN);

export const loadTokenFromApiKey = createAction(LOAD_TOKEN_FROM_API_KEY);
export const requestTokenFromApiKey = createAction(REQUEST_TOKEN_FROM_API_KEY);

export const loadOauthProviders = createAction(LOAD_OAUTH_PROVIDERS);
export const requestOauthProviders = createAction(REQUEST_OAUTH_PROVIDERS);
export const receiveOauthProviders = createAction(RECEIVE_OAUTH_PROVIDERS);
export const testOauthEnabled = createAction(TEST_OAUTH_ENABLED);
export const setOauthEnabled = createAction(SET_OAUTH_ENABLED);

export const loadMe = createAction(LOAD_ME);
export const requestMe = createAction(REQUEST_ME);
export const receiveMe = createAction(SET_ME);

export const usernameLogin = createAction(USERNAME_LOGIN);
export const nerscLogin = createAction(NERSC_LOGIN);

export const setToken = createAction(SET_TOKEN);
export const setMe = createAction(SET_ME);

export const showLoginOptions = createAction(SHOW_LOGIN_OPTIONS);
export const showGirderLogin = createAction(SHOW_GIRDER_LOGIN);
export const showNerscLogin = createAction(SHOW_NERSC_LOGIN);


// Reducer

// For some reason the reducer created by redux-actions' handleActions() doesn't
// seem to work. For the sake of time, implementing a plain reducer instead.

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_TOKEN: {
      const token = action.payload;
      // const providers = null;
      // const oauth = {
      //     providers
      // }
      return {...state, token};
    }

    case SET_AUTHENTICATING: {
      const authenticating = action.payload;
      return {...state, authenticating};
    }

    case SET_ME: {
      const me = action.payload
      return {...state, me};
    }

    case REQUEST_INVALIDATE_TOKEN: {
      if (action.error) {
        return {...state, error: action.payload.error};
      }
      else {
        return {...state,  error:null };
      }
    }

    case REQUEST_OAUTH_PROVIDERS: {
      if (action.error) {
        return {...state, error: action.payload.error};
      }
      else {
        return {...state,  error:null };
      }
    }

    case SET_OAUTH_ENABLED: {
      const enabled = action.payload;
      const oauth = {
        ...state.oauth,
        enabled
      }
      return {...state, oauth};
    }

    case RECEIVE_OAUTH_PROVIDERS: {
      const providers = action.payload;
      const oauth = {
          ...state.oauth,
          providers
      }
      return {...state, oauth};
    }

    case SHOW_LOGIN_OPTIONS: {
      const show = action.payload;
      const ui = {...state.ui};
      ui.showLoginOptions = show;
      return {...state, ui}
    }

    case SHOW_GIRDER_LOGIN: {
      const show = action.payload;
      const ui = {...state.ui};
      ui.girder = {show};
      return {...state, ui}
    }

    case SHOW_NERSC_LOGIN: {
      const show = action.payload;
      const ui = {...state.ui};
      ui.nersc = {show};
      return {...state, ui}
    }

    default:  {
      return state;
    }
  }
}

export default reducer;
