import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'energy-plot',
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
