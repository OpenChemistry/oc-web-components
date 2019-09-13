import React from 'react';

import Route from '.';


export const privateCondition = (authenticating, authenticated) => !authenticating && authenticated;

export default (props) => (
  <Route {...props} condition={privateCondition} />
);
