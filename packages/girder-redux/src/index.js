import { authActions, notificationsActions, adminActions } from './ducks';
import { authSelectors, notificationsSelectors, adminSelectors } from './ducks';
import { authReducer, notificationsReducer, adminReducer } from './ducks';
import { authSagas, notificationsSagas, adminSagas } from './sagas';

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
