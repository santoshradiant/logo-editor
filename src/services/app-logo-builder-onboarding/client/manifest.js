import '@babel/polyfill'
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from 'react'
import singleSpaReact from 'single-spa-react'
import rootComponent from './hot-app'
import ReactDOM from 'react-dom/client'
import smoothscroll from 'smoothscroll-polyfill'
import config from '../config'
smoothscroll.polyfill()

const setLocalPublicPath = appConfig => {
  const runtimeConfig = window.shellRuntime
  // Check in import map overrides if the current app is running locally.
  const appIsRunningLocal =
    window.importMapOverrides && window.importMapOverrides.getOverrideMap().imports.hasOwnProperty(appConfig.name)
  // Only set public path if shell is running from localhost.
  if (window.location.hostname === 'localhost' && runtimeConfig && !appIsRunningLocal) {
    // Override webpack public path
    __webpack_public_path__ = runtimeConfig._urls.app + appConfig.publicPath + '/' // eslint-disable-line
  }
}

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent,
  domElementGetter: () => {
    const appName = config.name
    let element = document.querySelector('#content .' + appName)
    if (element) {
      return element
    }

    if (!window.EventSource) {
      import(/* webpackChunkName: "event-source-polyfill" */ 'event-source-polyfill') //eslint-disable-line
    }

    if (!window.Intl) {
      import(/* webpackChunkName: "intl" */ 'intl') //eslint-disable-line
      import(/* webpackChunkName: "intl-en" */ 'intl/locale-data/jsonp/en.js') //eslint-disable-line
    }

    setLocalPublicPath(config)
    const contentDiv = document.getElementById('content')
    if (!contentDiv) {
      throw new Error('div.#content is missing, this is an error shell app!')
    }
    element = document.createElement('div')
    element.setAttribute('class', appName)
    contentDiv.appendChild(element)
    return element
  },
  renderType: 'createRoot', // Use React 19's createRoot for rendering.
})

const bootstrap = [reactLifecycles.bootstrap]

const mount = [reactLifecycles.mount]

const unmount = [
  reactLifecycles.unmount,
  () =>
    new Promise(resolve => {
      const stylingDivId = `styling-${config.name}`
      const stylingDiv = document.getElementById(stylingDivId)
      if (stylingDiv) {
        stylingDiv.remove()
      }
      resolve()
    })
]

const update = [reactLifecycles.update]

export { bootstrap, mount, unmount, update }
