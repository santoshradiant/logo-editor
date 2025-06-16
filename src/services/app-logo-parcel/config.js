const name = 'app-logo-parcel'
const path = require('path')
const config = {
  name,

  devPort: 3219,

  // sets the default theme from the /brands folder
  brand: 'websitebuilder',
  // brand: 'constantcontact',
  enableAnalyze: false,

  // set the environment, this will change the urls 'dev', 'prototype3'
  env: 'dev',
  publicPath: '/logo-parcel',

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

  mergeModule(merge, moduleConfig, cliContext) {
    const modules = merge(moduleConfig, {})

    const adjustedRules = modules.rules.filter((x) => x.loader !== 'file-loader' && x.use !== 'url-loader?limit=5000')
    adjustedRules.push({
      test: /\.(jpg|jpeg|png|gif|svg|pdf|ico|woff(2)?|ttf|eot)(\?[a-z0-9]+)?$/,
      loader: 'file-loader',
      options: {
        // default + hash
        postTransformPublicPath: (p) => {
          if (!cliContext.isProduction) {
            return p
          }
          p = p.replace('__webpack_public_path__ + ', '')
          const hash = cliContext.buildNumber ? '?hash=' + cliContext.buildNumber : ''
          return 'window.changeAssetPath("' + name + '",' + p + ',"' + hash + '")'
        }
      }
    })
    modules.rules = adjustedRules
    return modules
  },

  configWebpack(configWebpack) {
    configWebpack.resolve.fallback = {
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify')
    }
    Object.assign(configWebpack.resolve.alias, {
      authentication_alias: path.join(__dirname, '../../helpers/authentication-helper.js')
    })
    configWebpack.output.library = 'app-logo-parcel'
    configWebpack.output.libraryTarget = 'umd'
  }
}

module.exports = config
