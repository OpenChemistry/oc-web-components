import { Component } from 'react';

import { connect } from 'react-redux';

import { auth } from '@openchemistry/girder-redux';

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
  const providers = auth.selectors.getOauthProviders(state);
  const authenticating = auth.selectors.isAuthenticating(state);
  return {
    providers,
    authenticating,
  }
}

OauthRedirect = connect(redirectMapStateToProps)(OauthRedirect)

export default OauthRedirect;
