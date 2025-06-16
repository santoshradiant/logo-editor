const name = 'app-logo'
const path = require('path')

const config = {
  name: name,

  devPort: 3207,

  // sets the default theme from the /brands folder
  brand: 'websitebuilder',
  // brand: 'constantcontact',

  // set the environment, this will change the urls 'dev', 'prototype3'
  env: 'uat',
  publicPath: '/logo',

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

  getCustomRuntimeConfig(runtimeConfig) {
    return Object.assign({}, runtimeConfig, {
      _fetchXsrfTokenHeaderName: 'X-CSRF-TOKEN',
      _fetchXsrfTokenSiteName: 'accounts_api',
      _fetchXsrfTokenEndpoint: '/v1.0/session/preauth',
      _fetchTokenSiteName: 'control-panel',
      _enableAppGateway: true,
      _defaultApiName: 'logos'
    })
  },

  configWebpack(configWebpack) {
    configWebpack.output.library = 'app-logo'

    configWebpack.resolve.fallback = { path: require.resolve('path-browserify') }
    Object.assign(configWebpack.resolve.alias, {
      authentication_alias: path.join(__dirname, '../../helpers/authentication-helper.js')
    })

    configWebpack.output.libraryTarget = 'umd'
  }
}

module.exports = config
