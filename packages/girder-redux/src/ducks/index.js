// AUTH

// Import actions
import {
  authenticate,
  setAuthenticating,
  invalidateToken,
  loadMe,
  loadOauthProviders,
  usernameLogin,
  showLoginOptions,
  showGirderLogin,
  testOauthEnabled,
  showNerscLogin,
  nerscLogin,
  setMe,
  setToken
} from './auth';

// Import selectors
import {
  setRoot,
  getMe,
  getToken,
  getOauthProviders,
  isOauthEnabled,
  isAuthenticated,
  isAuthenticating,
  getShowLoginOptions,
  getShowGirderLogin,
  getShowNerscLogin
} from './auth';

// Import reducer
export {default as authReducer} from './auth';

export const authActions = {
  authenticate,
  invalidateToken,
  loadMe,
  loadOauthProviders,
  usernameLogin,
  showLoginOptions,
  showGirderLogin,
  testOauthEnabled,
  setAuthenticating,
  showNerscLogin,
  nerscLogin,
  setMe,
  setToken
}

export const authSelectors = {
  setRoot,
  getMe,
  getToken,
  getOauthProviders,
  isOauthEnabled,
  isAuthenticated,
  isAuthenticating,
  getShowLoginOptions,
  getShowGirderLogin,
  getShowNerscLogin
}
