import { default as LoginButton } from './auth/containers/login-button';
import { default as LoginOptions } from './auth/containers/login-options';
import { default as GirderLogin } from './auth/containers/girder-login';
import { default as OauthRedirect } from './auth/containers/oauth-redirect';
import { default as UserMenu } from './auth/containers/user-menu';
import { default as NerscLogin } from './auth/containers/nersc-login';

export const auth = {
  LoginButton,
  LoginOptions,
  GirderLogin,
  OauthRedirect,
  UserMenu,
  NerscLogin
}
