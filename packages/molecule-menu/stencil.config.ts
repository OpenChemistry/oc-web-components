import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'molecule-menu',
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
