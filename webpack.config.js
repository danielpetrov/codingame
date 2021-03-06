var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './solution.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        },
        exclude: /node_modules/,
      }
    ]
  },
  stats: {
    colors: true
  },
  mode: 'development'
}
