// import { getClientEnvironment } from './src/env'
const path = require('path')
const webpack = require('webpack')
const { getClientEnvironment } = require('./src/env')

const env = getClientEnvironment()
const isProduction = process.env.NODE_ENV === 'production'

const config = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    library: 'logoMfeLoader',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: path.resolve(__dirname, 'dist'),
    filename: 'mfe-loader-app-logo.js',
    // this defaults to 'window', but by setting it to 'this' then
    // module chunks which are built will work in web workers as well.
    globalObject: 'this'
  },
  devServer: {
    open: true,
    host: 'localhost'
  },
  plugins: [new webpack.DefinePlugin(env.stringified)],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset'
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ]
  }
}

module.exports = () => {
  if (isProduction) {
    config.mode = 'production'
  } else {
    config.mode = 'development'
  }
  return config
}
