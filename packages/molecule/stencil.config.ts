import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'molecule',
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
