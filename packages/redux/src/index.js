import moleculesReducer, * as molecules  from './ducks/molecules';
import calculationsReducer, * as calculations  from './ducks/calculations';
import usersReducer, * as users  from './ducks/users';
import girderReducer, * as girder  from './ducks/girder';
import appReducer, * as app  from './ducks/app';
import cumulusReducer, * as cumulus  from './ducks/cumulus';
import nerscReducer, * as nersc  from './ducks/nersc';
import jupyterlabReducer, * as jupyterlab from './ducks/jupyterlab';


export const reducers = {
    molecules: moleculesReducer,
    calculations: calculationsReducer,
    users: usersReducer,
    girder: girderReducer,
    app: appReducer,
    cumulus: cumulusReducer,
    nersc: nerscReducer,
    jupyterlab: jupyterlabReducer
};

export { default as selectors } from './selectors';

export {molecules};
export {calculations};
export {users};
export {girder};
export {cumulus};
export {nersc};
export {jupyterlab};
export {app};
