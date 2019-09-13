import React from 'react';

import Route from '.';


const publicCondition = (authenticating) => !authenticating;

export default (props) => (
  <Route {...props} condition={publicCondition} />
);
