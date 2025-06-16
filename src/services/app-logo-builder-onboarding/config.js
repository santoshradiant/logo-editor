const path = require('path')
const config = {
  name: 'app-logo-builder-onboarding',

  devPort: 3206,

  // sets the default theme from the /brands folder
  brand: 'sitey',
  // brand: 'constantcontact',

  // set the environment, this will change the urls 'dev', 'prototype3'
  env: 'dev',
  publicPath: '/logo-onboarding',

  // Logger for redux, defaults to false when in production
  reduxLogger: true,
  entry: {
    main: 'manifest'
  },
  apiKeys: {
    dev: {
      raygun: 'wbXapaIEvI14RKmbOfDgw'
    },
    qa: {
      raygun: 'KX1DTt7AqZPLSmhUBjUhGw'
    },
    uat: {
      raygun: 'RUDvRR6vGbWhtFjSamEYHw'
    },
    prod: {
      raygun: 'JBio3WHzcSrN8yYkNg'
    }
  },
  configWebpack(configWebpack) {
    configWebpack.resolve.fallback = {
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify')
    }
    Object.assign(configWebpack.resolve.alias, {
      authentication_alias: path.join(__dirname, '../../helpers/authentication-helper.js')
    })
    configWebpack.output.library = 'app-logo-builder-onboarding'
    configWebpack.output.libraryTarget = 'umd'
  },

  getCustomRuntimeConfig(runtimeConfig) {
    return Object.assign({}, runtimeConfig, {
      _fetchXsrfTokenHeaderName: 'X-CSRF-TOKEN',
      _fetchXsrfTokenSiteName: 'app-gateway',
      _fetchXsrfTokenEndpoint: '/accounts/v1.0/session/preauth',
      _fetchTokenSiteName: 'accounts',
      _fetchTokenEndpoint: '/v1.0/session/validate',
      _enableAppGateway: true,
      _defaultApiName: 'logos'
    })
  },

  getCurrentBrand(env) {
    if (env && env.brand) {
      return env.brand
    }

    return this.brand
  }
}

module.exports = config
