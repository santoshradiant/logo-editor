/* eslint-disable import/first */
window.System = {}
window.System.import = jest.fn().mockReturnValue([])

import React from 'react'
import { render } from '@testing-library/react'
import BootstrapperContext from '@eig-builder/module-bootstrapper/contexts/BootstrapperContext'
import extraScopePlugin from '@eig-builder/module-bootstrapper/packages/stylis-plugin-extra-scope'
import localRuntimeConfigMock from '@eig-builder/core-unit-test/__mocks__/app-config.js'
import * as GlobalStore from '@eig-builder/core-utils/store'
import { StyleSheetManager, ThemeProvider as StyledThemeProvider } from 'styled-components'
import { createGenerateClassName, createMuiTheme, MuiThemeProvider, StylesProvider } from '@material-ui/core/styles'
import { ModalContextProviderWrapper } from '@eig-builder/module-modals/withModalContext'
import { Reducers as ModalsReducers } from '@eig-builder/module-modals'
import { Reducer as RouterReducer } from '@eig-builder/module-router'
import { getRuntimeConfig, setRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'
import { LocalizationContainer, LocalizeDebugHelper } from '@eig-builder/module-localization'
import {
  NotificationBarContainer,
  NotificationBarWrapperWithContext
} from '@eig-builder/module-notification-bar-with-context'
import { Provider } from 'react-redux'
import BrandMuiTheme from 'muitheme'

const reducers = [
  // MyLogosReducers,

  // System reducers
  RouterReducer,
  ModalsReducers
]

const reduxStore = GlobalStore.create({}, reducers, [])

// Mock window.SystemJS
// global.System = {
//   import: props => {
//     console.log('ðŸ¦ MOCKING SystemJS', props)
//     return Promise.resolve({ runtime: appConfig })
//   }
// }

const translations = localRuntimeConfigMock.translations
setRuntimeConfig(localRuntimeConfigMock.runtime)
// const appName = 'app-logo'

// eslint-disable-next-line react/prop-types
const AllTheProviders = ({ children, appName = 'app-logo' }) => {
  const options = {
    analyticsService: null,
    defaultRoute: '/',
    store: reduxStore
  }

  const generateClassName = createGenerateClassName({
    productionPrefix: 'c',
    seed: appName
  })
  const stylisePlugins = [extraScopePlugin(`.${getRuntimeConfig()._app}`)]
  const muiTheme = createMuiTheme(BrandMuiTheme)
  const getStyleDiv = () => {
    const styleDivId = `styling-${getRuntimeConfig()._app}`
    let styleDiv = document.getElementById(styleDivId)
    if (styleDiv) {
      return styleDiv
    }
    styleDiv = document.createElement('div')
    styleDiv.setAttribute('id', styleDivId)
    document.body.appendChild(styleDiv)
    return styleDiv
  }

  return (
    <div className={appName}>
      <StyleSheetManager target={getStyleDiv()} stylisPlugins={stylisePlugins}>
        <BootstrapperContext.Provider value={options}>
          <Provider store={options.store}>
            <MuiThemeProvider theme={muiTheme}>
              <StyledThemeProvider theme={muiTheme}>
                <StylesProvider generateClassName={generateClassName}>
                  <LocalizationContainer _localizeDebug={LocalizeDebugHelper()} translations={translations}>
                    <ModalContextProviderWrapper>
                      <NotificationBarWrapperWithContext>
                        <>
                          <NotificationBarContainer targetKey='fullscreen' />
                          {children}
                        </>
                      </NotificationBarWrapperWithContext>
                    </ModalContextProviderWrapper>
                  </LocalizationContainer>
                </StylesProvider>
              </StyledThemeProvider>
            </MuiThemeProvider>
          </Provider>
        </BootstrapperContext.Provider>
      </StyleSheetManager>
    </div>
  )
}

const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render, AllTheProviders }
