const webpack = require('webpack');
const path = require('path');

const pkg = require('./package.json');
const libraryName= pkg.name;

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, "./src/index.js"),
  output: {      
    path: path.join(__dirname, './dist'),
    filename: 'main.js',
    library: libraryName,
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: true
  },
  resolve: {
    alias: {          
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'assets': path.resolve(__dirname, 'assets') 
    }  
  },
  externals: {
    // Don't bundle react or react-dom      
    react: {          
      commonjs: "react",          
      commonjs2: "react",          
      amd: "React",          
      root: "React"      
    },      
    "react-dom": {          
        commonjs: "react-dom",          
        commonjs2: "react-dom",          
        amd: "ReactDOM",          
        root: "ReactDOM"      
    }
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options:{
              fallback: "file-loader",
              name: "[name][md5:hash].[ext]",
              outputPath: 'assets/',
              publicPath: '/assets/'
            }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        use: ["babel-loader"],
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
      },
    ]
  }
}
