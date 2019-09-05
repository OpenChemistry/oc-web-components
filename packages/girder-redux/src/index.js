import { authActions, notificationsActions, adminActions, userActions } from './ducks';
import { authSelectors, notificationsSelectors, adminSelectors, userSelectors } from './ducks';
import { authReducer, notificationsReducer, adminReducer, userReducer } from './ducks';
import { authSagas, notificationsSagas, adminSagas, userSagas } from './sagas';

export { default as girderClient } from '@openchemistry/girder-client';

export const auth = {
  actions: authActions,
  selectors: authSelectors,
  sagas: authSagas,
  reducer: authReducer
}

export const notifications = {
  actions: notificationsActions,
  selectors: notificationsSelectors,
  sagas: notificationsSagas,
  reducer: notificationsReducer
}

export const admin = {
  actions: adminActions,
  selectors: adminSelectors,
  sagas: adminSagas,
  reducer: adminReducer
}

export const user = {
  actions: userActions,
  selectors: userSelectors,
  sagas: userSagas,
  reducer: userReducer
}
