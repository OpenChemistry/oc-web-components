import { createAction, handleActions } from 'redux-actions';

export const REDIRECT_TO_JUPYTERHUB = 'REDIRECT_TO_JUPYTERHUB';
export const REDIRECTING_TO_JUPYTERHUB = 'REDIRECTING_TO_JUPYTERHUB';
export const INVALIDATE_SESSION = 'INVALIDATE_SESSION'
export const REQUEST_SESSION_INVALIDATION = 'REQUEST_SESSION_INVALIDATION';
export const SHOW_JUPYTERLAB_INTEGRATION = 'SHOW_JUPYTERLAB_INTEGRATION';

const initialState = {
  error: null,
  redirecting: false,
  showJupyterlabIntegration: false
};

// Reducer
const reducer = handleActions({
  [REDIRECTING_TO_JUPYTERHUB]: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error, redirecting: false};
    }
    else {
      return {...state,  error: null, redirecting: true };
    }
  },
  [REQUEST_SESSION_INVALIDATION]: (state, action) => {
    if (action.error) {
      return {...state, error: action.payload.error};
    }
    else {
      return {...state,  error: null };
    }
  },
  [SHOW_JUPYTERLAB_INTEGRATION]: (state, action) => {
    const show = action.payload;
    return {...state,  showJupyterlabIntegration: show };
  }
}, initialState);


export const redirectToJupyterHub = createAction(REDIRECT_TO_JUPYTERHUB,
                                                 (notebookPath) => ({notebookPath}))
export const redirectingToJupyterHub = createAction(REDIRECTING_TO_JUPYTERHUB)
export const invalidateSession = createAction(INVALIDATE_SESSION, (login) => ({login}))
export const requestSessionInvalidation = createAction(REQUEST_SESSION_INVALIDATION)
export const showJupyterlabIntegration = createAction(SHOW_JUPYTERLAB_INTEGRATION);

export default reducer;
