// Export action watchers
import {
  watchAuthenticate,
  watchFetchMe,
  watchFetchOauthProviders,
  watchTestOauthEnabled,
  watchInvalidateToken,
  watchNewToken,
  watchUsernameLogin,
  watchNerscLogin,
  watchLoadTokenFromApiKey,
  watchFetchApiKey
} from './auth';

export const authSagas = {
  watchAuthenticate,
  watchFetchMe,
  watchFetchOauthProviders,
  watchTestOauthEnabled,
  watchInvalidateToken,
  watchNewToken,
  watchUsernameLogin,
  watchNerscLogin,
  watchLoadTokenFromApiKey,
  watchFetchApiKey
}

import * as notifications from './notifications';
export const notificationsSagas = notifications;

import {
  watchFetchUserInformation,
  watchUpdateUserInformation,
  watchTwitterLogin,
  watchOrcidLogin
} from './user';

export const userSagas = {
  watchFetchUserInformation,
  watchUpdateUserInformation,
  watchTwitterLogin,
  watchOrcidLogin
}
