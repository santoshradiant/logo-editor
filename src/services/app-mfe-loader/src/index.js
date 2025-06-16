const { mfeLoader } = require('./mfe-loader')
const { componentUrls } = require('./config/component-urls')

const componentMapUrl = componentUrls[process.env.NODE_ENV]

export const loadScripts = componentName => {
  return mfeLoader(componentName, componentMapUrl)
}
