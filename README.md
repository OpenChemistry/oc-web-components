# oc-web-components
[![CircleCI Status](https://circleci.com/gh/OpenChemistry/oc-web-components.svg?style=shield)](https://circleci.com/gh/OpenChemistry/oc-web-components)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

[Lerna](https://github.com/lerna/lerna) monorepo containing Open Chemistry npm packages.

## Table of Contents
- [Packages](#packages)
- [Build](#build)
- [Develop](#develop)


## Packages
|   |   |
|---|---|
| [`@openchemistry/types`](#openchemistry_types) | [![npm package](https://img.shields.io/npm/v/@openchemistry/types.svg)](https://www.npmjs.com/package/@openchemistry/types) |
| [`@openchemistry/utils`](#openchemistry_utils) | [![npm package](https://img.shields.io/npm/v/@openchemistry/utils.svg)](https://www.npmjs.com/package/@openchemistry/utils) |
| [`@openchemistry/moljs-es`](#openchemistry_moljs-es) | [![npm package](https://img.shields.io/npm/v/@openchemistry/moljs-es.svg)](https://www.npmjs.com/package/@openchemistry/moljs-es) |
| [`@openchemistry/molecule-moljs`](#openchemistry_molecule-moljs) | [![npm package](https://img.shields.io/npm/v/@openchemistry/molecule-moljs.svg)](https://www.npmjs.com/package/@openchemistry/molecule-moljs) |
| [`@openchemistry/molecule-vtkjs`](#openchemistry_molecule-vtkjs) | [![npm package](https://img.shields.io/npm/v/@openchemistry/molecule-vtkjs.svg)](https://www.npmjs.com/package/@openchemistry/molecule-vtkjs) |
| [`@openchemistry/molecule-menu`](#openchemistry_molecule-menu) | [![npm package](https://img.shields.io/npm/v/@openchemistry/molecule-menu.svg)](https://www.npmjs.com/package/@openchemistry/molecule-menu) |
| [`@openchemistry/volume-controls`](#openchemistry_volume-controls) | [![npm package](https://img.shields.io/npm/v/@openchemistry/volume-controls.svg)](https://www.npmjs.com/package/@openchemistry/volume-controls) |
| [`@openchemistry/vibrational-spectrum`](#openchemistry_vibrational-spectrum) | [![npm package](https://img.shields.io/npm/v/@openchemistry/vibrational-spectrum.svg)](https://www.npmjs.com/package/@openchemistry/vibrational-spectrum) |
| [`@openchemistry/molecule`](#openchemistry_molecule) | [![npm package](https://img.shields.io/npm/v/@openchemistry/molecule.svg)](https://www.npmjs.com/package/@openchemistry/molecule) |
| [`@openchemistry/energy-plot`](#openchemistry_energy-plot) | [![npm package](https://img.shields.io/npm/v/@openchemistry/energy-plot.svg)](https://www.npmjs.com/package/@openchemistry/energy-plot) |
| [`@openchemistry/sample-data`](#openchemistry_sample-data) | [![npm package](https://img.shields.io/npm/v/@openchemistry/sample-data.svg)](https://www.npmjs.com/package/@openchemistry/sample-data) |
| [`@openchemistry/girder-client`](#openchemistry_girder-client) | [![npm package](https://img.shields.io/npm/v/@openchemistry/girder-client.svg)](https://www.npmjs.com/package/@openchemistry/girder-client) |
| [`@openchemistry/girder-redux`](#openchemistry_girder-redux) | [![npm package](https://img.shields.io/npm/v/@openchemistry/girder-redux.svg)](https://www.npmjs.com/package/@openchemistry/girder-redux) |
| [`@openchemistry/girder-ui`](#openchemistry_girder-ui) | [![npm package](https://img.shields.io/npm/v/@openchemistry/girder-ui.svg)](https://www.npmjs.com/package/@openchemistry/girder-ui) |
| [`@openchemistry/rest`](#openchemistry_rest) | [![npm package](https://img.shields.io/npm/v/@openchemistry/rest.svg)](https://www.npmjs.com/package/@openchemistry/rest) |
| [`@openchemistry/redux`](#openchemistry_redux) | [![npm package](https://img.shields.io/npm/v/@openchemistry/redux.svg)](https://www.npmjs.com/package/@openchemistry/redux) |
| [`@openchemistry/sagas`](#openchemistry_sagas) | [![npm package](https://img.shields.io/npm/v/@openchemistry/sagas.svg)](https://www.npmjs.com/package/@openchemistry/sagas) |


### `@openchemistry/types`
- TypeScript interfaces used across all packages.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/types)


### `@openchemistry/utils`
- Auxiliary functions to convert and validate cjson data, and components props.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/utils)


### `@openchemistry/moljs-es`
- Wrapper around [3dmoljs](https://github.com/3dmol/3Dmol.js) to turn it into an ES6 module.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/moljs-es)


### `@openchemistry/molecule-moljs`
- A web component to display chemical json data that uses [3dmoljs](https://github.com/3dmol/3Dmol.js).
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/molecule-moljs)


### `@openchemistry/molecule-vtkjs`
- A web component to display chemical json data that uses [vtkjs](https://github.com/kitware/vtk-js).
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/molecule-vtkjs)


### `@openchemistry/volume-controls`
- A web component to visualize and manipulate the color transfer function.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/volume-controls)


### `@openchemistry/molecule-menu`
- A web component to tweak the visual appearance of the molecular viewers.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/molecule-menu)


### `@openchemistry/vibrational-spectrum`
- A web component to display the vibrational spectrum of a molecule.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/vibrational-spectrum)


### `@openchemistry/molecule`
- A high level web component combining `molecule-vtkjs`, `molecule-moljs`, `vibrational-spectrum` and `molecule-menu`.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/molecule)


### `@openchemistry/energy-plot`
- A web component to display the free energy of a set of reactions.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/energy-plot)


### `@openchemistry/sample-data`
- Sample cjson data for demo purposes.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/sample-data)


### `@openchemistry/girder-client`
- A utility client to make authenticated HTTP requests to a girder instance.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/girder-client)


### `@openchemistry/girder-redux`
- Redux ducks and sagas containing the boilerplate needed to perform various common operations (auth, notifications, ...) on a girder instance.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/girder-redux)


### `@openchemistry/girder-ui`
- Reusable React UI components to perform common operations (auth, notifications, ...) on an app with a girder server.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/girder-redux)


### `@openchemistry/rest`
- [LEGACY] A set of function to perform REST calls specific to the mongochem project.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/rest)


### `@openchemistry/redux`
- [LEGACY] Redux ducks and sagas specific to the mongochem project.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/redux)


### `@openchemistry/sagas`
- [LEGACY] Redux sagas specific to the mongochem project.
- [Sources and Docs](https://github.com/OpenChemistry/oc-web-components/tree/master/packages/sagas)


## Build

To build all the packages in the monorepo, follow the steps below.

Clone the repository:
```
git clone git@github.com:OpenChemistry/oc-web-components.git
```

Install the monorepo dependencies and bootstrap the various packages:
```
cd oc-web-components
yarn install
yarn run bootstrap
```

Build the packages:
```
yarn run build
```

## Develop
To use the local dev version of the Open Chemistry packages within the mongochem project follow the steps below.

NOTE: When linking the packages in development, `yarn` **must** be used instead of `npm`.

Build all the packages in the monorepo. See instructions [above](#build).

Create local links for all the packages:
```bash
# From the oc-web-components root directory

export OPENCHEMISTRY_PACKAGES=$(ls packages)

for package in $OPENCHEMISTRY_PACKAGES; do \
  cd packages/${package} && \
  yarn unlink && \
  yarn link && \
  cd ../../
done;
```

Consume the linked packages in the mongochemclient:
```bash
# From the mongochemclient root directory

yarn install

for package in $OPENCHEMISTRY_PACKAGES; do \
  yarn link @openchemistry/${package}
done;

yarn run start
```
