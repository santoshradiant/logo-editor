import React from 'react'
import PropTypes from 'prop-types'
import BootStrapper from '@eig-builder/module-bootstrapper'
import { SingleSpaContext } from 'single-spa-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createTheme } from '@mui/material/styles'
import { merge } from 'lodash'
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
// import LandscapeWarning from 'core/components/landscape-warning'
import LocalRuntimeConfig from '../runtime.json'

// Modify global header
import { setGlobalModifyHeader } from '@eig-builder/core-utils/helpers/fetch-helper'
import { styled } from '@mui/material/styles'

const CssFixForWordpress = styled('div')`
  .d-flex {
    display: flex;
  }
  .pl-4,
  .px-4 {
    padding-left: 1.5rem !important;
  }
  .pr-4,
  .px-4 {
    padding-right: 1.5rem !important;
  }
  .mt-4,
  .my-4 {
    margin-top: 1.5rem !important;
  }
  .m-4 {
    margin: 1.5rem !important;
  }
  .p-4 {
    padding: 1.5rem !important;
  }
  input[type='color'],
  input[type='date'],
  input[type='datetime-local'],
  input[type='datetime'],
  input[type='email'],
  input[type='month'],
  input[type='number'],
  input[type='password'],
  input[type='search'],
  input[type='tel'],
  input[type='text'],
  input[type='time'],
  input[type='url'],
  input[type='week'],
  select,
  textarea {
    border: initial !important;
  }
  .pt-2,
  .py-2 {
    padding-top: 0.5rem !important;
  }
  .pb-4,
  .py-4 {
    padding-bottom: 1.5rem !important;
  }
  .mr-2,
  .mx-2 {
    margin-right: 0.5rem !important;
  }
`

if (typeof window.expresseditor?.JWT === 'string') {
  setGlobalModifyHeader((header) => {
    header.Authorization = `Bearer ${window.expresseditor.JWT}`
  })
}

const queryClient = new QueryClient()

const routes = [EditorRoutes, OnboardingRoutes, TransferRoutes, MyLogosRoutes]

const reducers = [
  MyLogosReducers,

  // System reducers
  RouterReducer,
  ModalsReducers
]

const appWrapper = (props) => {
  const { properties } = React.useContext(SingleSpaContext)

  React.useEffect(() => {
    properties?.onComponentDidMount?.()
  }, [properties?.onComponentDidMount])

  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationConfigContext baseName='/logo-parcel'>
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

const store = GlobalStore.create(config, reducers, [ApiMiddleware])
window.authState.subscribe((data) => {
  store && store.dispatch({ type: 'NEW_AUTH_STATE', body: data })
})

// { /* <LandscapeWarning> */ }
// { /* </LandscapeWarning> */ }
const App = () => {
  const useShellAnalytics = true
  // const isRunningInWordpress = !!(window.wp && window.wp.data)
  const analyticsService = new AnalyticsService(getDefaultLoggers(useShellAnalytics))
  return (
    <AppSetup appName={config.name} localRuntimeConfig={LocalRuntimeConfig}>
      <CssFixForWordpress>
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
                defaultRoute='/logo-parcel/onboarding'
                basename='/logo-parcel'
                store={store}
                useMemoryHistory
                memoryProps={{
                  initialEntries: ['/onboarding'],
                  initialIndex: 0
                }}
                isMicroFrontend
                appWrapper={appWrapper}
                AuthenticationContainerProps={{
                  isMicroFrontend: true
                }}
              />
            )
          }}
        </AppSetupContext.Consumer>
      </CssFixForWordpress>
    </AppSetup>
  )
}

export default App
