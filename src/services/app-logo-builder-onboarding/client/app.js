import React from 'react'
import PropTypes from 'prop-types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createTheme } from '@mui/material/styles'
import { merge } from 'lodash'

import Bootstrapper from '@eig-builder/module-bootstrapper'
// Helpers
import { Reducer as RouterReducer } from '@eig-builder/module-router'
import EventsContainer from '@eig-builder/module-application-events'
import Modals from '@eig-builder/module-modals/containers/modal-root'

// New Modules
import ApiMiddleware from 'core/helpers/api-middleware'
import { Routes as MyLogosRoutes } from 'modules/my-logos'
import { Reducers as MyLogosReducers } from 'modules/shared-store'
import { Routes as EditorRoutes } from 'modules/editor'
import { Routes as OnboardingRoutes } from 'modules/onboarding'
import { Routes as TransferRoutes } from 'modules/transfer'
import ApplicationConfigContext from 'modules/application-config'
import FreeFlowAuthenticationModal from 'core/components/free-flow-authentication'
// System Routes and Reducers
import { Reducers as ModalsReducers } from '@eig-builder/module-modals'
// Configures and base initialization
import config from '../config'
import '@eig-builder/core-utils/base-style/main.scss'
import * as GlobalStore from '@eig-builder/core-utils/store'
import AppSetup, { AppSetupContext } from '@eig-builder/module-app-setup'
import LocalRuntimeConfig from '../runtime.json'
import AnalyticsService, { getDefaultLoggers } from '@eig-builder/core-utils/analytics'

const queryClient = new QueryClient()

const reducers = [
  MyLogosReducers,

  // System reducers
  RouterReducer,
  ModalsReducers
]
const routes = [EditorRoutes, OnboardingRoutes, MyLogosRoutes, TransferRoutes]

const store = GlobalStore.create(config, reducers, [ApiMiddleware])
window.authState.subscribe((data) => {
  store && store.dispatch({ type: 'NEW_AUTH_STATE', body: data })
})

const BaseRouterWrapper = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationConfigContext baseName='/logo-onboarding'>
        <EventsContainer>
          {props.children}
          <Modals />
          <FreeFlowAuthenticationModal />
        </EventsContainer>
      </ApplicationConfigContext>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
BaseRouterWrapper.propTypes = { children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]) }
export default () => {
  const useShellAnalytics = true
  const analyticsService = new AnalyticsService(getDefaultLoggers(useShellAnalytics))

  return (
    <AppSetup appName={config.name} localRuntimeConfig={LocalRuntimeConfig}>
      <AppSetupContext.Consumer>
        {({ translations, theme }) => {
          const themeOverride = createTheme(
            merge({}, theme, {
              components: {
                MuiButton: {
                  styleOverrides: {
                    root: {
                      textTransform: 'uppercase',
                      height: '40px'
                    }
                  }
                },
                MuiMenuItem: {
                  styleOverrides: {
                    root: {
                      textTransform: 'none'
                    }
                  }
                }
              }
            })
          )
          delete themeOverride.components.MuiBackdrop
          delete themeOverride.components.MuiSwitch.styleOverrides
          delete themeOverride.components.MuiOutlinedInput.styleOverrides
          return (
            <Bootstrapper
              analyticsService={analyticsService}
              muiTheme={themeOverride}
              appName={config.name}
              translations={translations}
              routes={routes}
              defaultRoute='/onboarding'
              basename='/logo-onboarding'
              store={store}
              isMicroFrontend
              appWrapper={BaseRouterWrapper}
              AuthenticationContainerProps={{
                isMicroFrontend: true
              }}
            />
          )
        }}
      </AppSetupContext.Consumer>
    </AppSetup>
  )
}
