import { Component } from 'react';

import { connect } from 'react-redux';

import {
  isAuthenticating,
  getOauthProviders
} from '@openchemistry/girder-auth-redux';

import { getAuthState } from '../../utils';

class OauthRedirect extends Component {
  render = () => {
    const {providers, authenticating} = this.props;
    if (authenticating && providers && providers.Google) {
      window.location = providers.Google;
    }
    return null;
  }
}

function redirectMapStateToProps(state, ownProps) {
  const providers = getOauthProviders(getAuthState(state));
  const authenticating = isAuthenticating(getAuthState(state));
  return {
    providers,
    authenticating,
  }
}

OauthRedirect = connect(redirectMapStateToProps)(OauthRedirect)

export default OauthRedirect;
