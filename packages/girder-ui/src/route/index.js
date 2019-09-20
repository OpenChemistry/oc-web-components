import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Route as BaseRoute } from 'react-router';
import PropTypes from 'prop-types';

import { auth } from '@openchemistry/girder-redux';


class Route extends BaseRoute {
  render() {
    const { component, fallback, condition, authenticating, authenticated, ...rest } = this.props;

    if (!component) {
      return null;
    }

    const RenderComponent = component;
    const FallbackComponent = fallback || null;

    if (condition(authenticating, authenticated)) {
      return (
        <BaseRoute
          {...rest}
          render={(props) => <RenderComponent {...props}/>}
        />
      );
    }
    else {
      return ( FallbackComponent ? <FallbackComponent {...rest}/> : null);
    }
  }
}

Route.propTypes = {
  conditon: PropTypes.func,
  component: PropTypes.oneOf([PropTypes.object, PropTypes.func]),
  fallback: PropTypes.oneOf([PropTypes.object, PropTypes.func]),
  authenticated: PropTypes.bool,
  authenticating: PropTypes.bool
}

Route.defaultProps = {
  condition: () => true,
  fallback: undefined,
  authenticated: false,
  authenticating: false
}

const mapStateToProps = (state) => {
  return {
    authenticating: auth.selectors.isAuthenticating(state),
    authenticated: !!auth.selectors.getMe(state)
  };
}

export default connect(mapStateToProps)(Route);
