import molecules  from './ducks/molecules';
import calculations  from './ducks/calculations';
import users  from './ducks/users';
import girder  from './ducks/girder';
import app  from './ducks/app';
import cumulus  from './ducks/cumulus';
import nersc  from './ducks/nersc';
import jupyterlab from './ducks/jupyterlab';

export const reducers = {
  molecules,
  calculations,
  users,
  girder,
  app,
  cumulus,
  nersc,
  jupyterlab
};

export { default as selectors } from './selectors';

export * from './ducks/molecules';
export * from './ducks/calculations';
export * from './ducks/users';
export * from './ducks/girder';
export * from './ducks/cumulus';
export * from './ducks/nersc';
export * from './ducks/jupyterlab';
export * from './ducks/app';
