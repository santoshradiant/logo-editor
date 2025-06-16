let runTimeConfig

// modify process env to new style
if (!runTimeConfig) {
  runTimeConfig = {}
}

function setRuntimeConfig (config) {
  runTimeConfig = config
}

function getRuntimeConfig () {
  return runTimeConfig
}

const appGateway = {
  development: 'https://api-gw.uat.builderservices.io',
  uat: 'https://api-gw.uat.builderservices.io',
  qa: 'https://api-gw.qa.builderservices.io',
  production: 'https://api-gw.builderservices.io'
}

const runtime = {
  _defaultApiName: 'logobuilder-api',
  version: 2,
  _brand: 'websitebuilder',
  _mfe: true,
  _fetchXsrfTokenHeaderName: 'X-CSRF-TOKEN',
  _env: process.env.NODE_ENV,
  _settings: { 'logomaker-brandname-readme-lock': false },
  _brandedUrls: {
    app_gateway: {
      api: appGateway[process.env.NODE_ENV]
    }
  }
}

const createRuntime = env => {
  return {
    ...runtime
  }
}

export { setRuntimeConfig, getRuntimeConfig, runtime, createRuntime }
