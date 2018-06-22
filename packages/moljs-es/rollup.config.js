import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: [{
      file: pkg.module, format: 'es'
    }],
    plugins: [
      resolve(), // so Rollup can find `3dmol`
      commonjs(), // so Rollup can convert `3dmol` to an ES module.
    ],
  }
];
