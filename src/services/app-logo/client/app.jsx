import React from 'react'
import PropTypes from 'prop-types'
import BootStrapper from '@eig-builder/module-bootstrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createTheme } from '@mui/material/styles'

// Helpers
import { Reducer as RouterReducer } from '@eig-builder/module-router'
import EventsContainer from '@eig-builder/module-application-events'
import Modals from '@eig-builder/module-modals/containers/modal-root'
import AnalyticsService, { getDefaultLoggers } from '@eig-builder/core-utils/analytics'

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
import AppSetup, { AppSetupContext } from '@eig-builder/module-app-setup'

// Configures and base initialization
import config from '../config'
import '@eig-builder/core-utils/base-style/main.scss'
import * as GlobalStore from '@eig-builder/core-utils/store'
import LocalRuntimeConfig from '../runtime.json'
import { merge } from 'lodash'

const queryClient = new QueryClient()

const routes = [MyLogosRoutes, EditorRoutes, OnboardingRoutes, TransferRoutes]

const reducers = [
  MyLogosReducers,

  // System reducers
  RouterReducer,
  ModalsReducers
]

const BaseRouterWrapper = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationConfigContext baseName='/logo'>
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

const store = GlobalStore.create(config, reducers, [ApiMiddleware])
window.authState.subscribe((data) => {
  store && store.dispatch({ type: 'NEW_AUTH_STATE', body: data })
})

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
            <BootStrapper
              analyticsService={analyticsService}
              muiTheme={themeOverride}
              appName={config.name}
              translations={translations}
              routes={routes}
              defaultRoute='/'
              basename='/logo'
              store={store}
              // BaseRouterWrapper={BaseRouterWrapper}
              appWrapper={BaseRouterWrapper}
              isMicroFrontend
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
