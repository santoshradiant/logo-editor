import React from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider as MUIThemeProvider, createTheme, styled } from '@mui/material/styles'
import { StylesProvider, createGenerateClassName } from '@mui/styles'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'

import Error from '@eig-builder/compositions-error'
import LogoMFE from 'modules/logo-mfe'
import AuthUjwtHelper from 'helpers/auth-ujwt-helper'
import { setRuntimeConfig, runtime } from 'helpers/runtime/runtime-config-helper'

import 'onboarding-scss'
import 'logo-maker-scss'
import 'logo-blender-main-scss'
import 'logo-scss'

import './i18n'
import { BrowserRouter } from 'react-router'
const queryClient = new QueryClient()

export const defaultCallback = () => ''
const StyledContainer = styled('div')`
  height: ${({ height = 0 }) => `calc(100vh - ${height}px)`};
`
const App = ({ theme, locale, element, token, callbacks }) => {
  const muiTheme = createTheme(theme ?? {})
  element.setAttribute('style', 'display: flex; flex-direction: column ')
  // get the height of the header
  const height = element.parentElement.firstElementChild.offsetHeight || 0

  const generateClassName = createGenerateClassName({
    seed: 'app-logo-mfe',
    productionPrefix: 'app-logo-mfe'
  })
  setRuntimeConfig(runtime)
  AuthUjwtHelper.setToken(token)
  AuthUjwtHelper.setRefreshCallback(callbacks?.refreshAccessToken ?? defaultCallback)

  return (
    <QueryClientProvider client={queryClient}>
      <MUIThemeProvider theme={muiTheme}>
        <StylesProvider injectFirst generateClassName={generateClassName}>
          <StyledContainer height={height}>
            {/* <ErrorBoundary FallbackComponent={() => <Error onClick={callbacks?.goBack} />}> */}
              {/* BrowserRouter only added to have useNavigate in the context */}
              <BrowserRouter>
                <LogoMFE goBack={callbacks?.goBack} />
              </BrowserRouter>
            {/* </ErrorBoundary> */}
          </StyledContainer>
        </StylesProvider>
      </MUIThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

App.propTypes = {
  callbacks: PropTypes.shape({
    refreshAccessToken: PropTypes.any,
    goBack: PropTypes.any
  }),
  locale: PropTypes.any,
  element: PropTypes.any,
  theme: PropTypes.object,
  token: PropTypes.any
}

export default App
