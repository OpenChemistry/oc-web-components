var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sagas.js',
    library: 'openchemistrySagas'
  },
  externals: [
    'jsonpath',
  ]
};
