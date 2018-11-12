import { authActions  } from './ducks';
import { authSelectors  } from './ducks';
import { authReducer } from './ducks';
import { authSagas } from './sagas';

export { default as girderClient } from '@openchemistry/girder-client';

export const auth = {
  actions: authActions,
  selectors: authSelectors,
  sagas: authSagas,
  reducer: authReducer
}
