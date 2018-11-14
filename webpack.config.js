const TerserPlugin = require('terser-webpack-plugin');
const webpack        = require('webpack');
const path           = require('path');
const commonConfig = {
  mode: 'production',
  entry  : './src/lib.ts',
  node: {
    fs: 'empty'

  },
  output : {
    filename     : 'index.js',
    path         : __dirname + '/dist/browser',
    libraryTarget: 'umd'
  },
  module : {
    rules: [
      {
        test   : /\.tsx?$/,
        loader : 'ts-loader',
        options: {
          transpileOnly: true
        },
        exclude: /node_modules/,
      },

    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias     : {
    }
  },

  optimization: {
    minimizer: [new TerserPlugin()]
  }
};
module.exports     = [
  commonConfig
  // Object.assign({}, commonConfig, { output: Object.assign({}, commonConfig.output, { path: commonConfig.output.path + '/browser' }) }),
];
