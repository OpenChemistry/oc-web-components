import { authActions, notificationsActions, userActions } from './ducks';
import { authSelectors, notificationsSelectors, userSelectors } from './ducks';
import { authReducer, notificationsReducer, userReducer } from './ducks';
import { authSagas, notificationsSagas, userSagas } from './sagas';

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

export const user = {
  actions: userActions,
  selectors: userSelectors,
  sagas: userSagas,
  reducer: userReducer
}
