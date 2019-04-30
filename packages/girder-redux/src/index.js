import { authActions, notificationsActions } from './ducks';
import { authSelectors, notificationsSelectors } from './ducks';
import { authReducer, notificationsReducer } from './ducks';
import { authSagas, notificationsSagas } from './sagas';

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
