import moleculesReducer, * as molecules  from './ducks/molecules';
import calculationsReducer, * as calculations  from './ducks/calculations';
import girderReducer, * as girder  from './ducks/girder';
import appReducer, * as app  from './ducks/app';
import cumulusReducer, * as cumulus  from './ducks/cumulus';
import jupyterlabReducer, * as jupyterlab from './ducks/jupyterlab';
import configurationReducer, * as configuration from './ducks/configuration';
import imagesReducer, * as images  from './ducks/images';

export const reducers = {
    molecules: moleculesReducer,
    calculations: calculationsReducer,
    girder: girderReducer,
    app: appReducer,
    cumulus: cumulusReducer,
    jupyterlab: jupyterlabReducer,
    configuration: configurationReducer,
    images: imagesReducer,
};

export { default as selectors } from './selectors';

export {molecules};
export {calculations};
export {girder};
export {cumulus};
export {jupyterlab};
export {app};
export {configuration};
export {images};
