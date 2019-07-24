import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'vibrational-spectrum',
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
