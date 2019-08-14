import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'molecule-vtkjs',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'docs-readme'
    }
  ]
};
