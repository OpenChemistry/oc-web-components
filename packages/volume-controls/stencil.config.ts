import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'volume-controls',
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
