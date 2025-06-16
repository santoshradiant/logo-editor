import React, { useEffect, useState } from 'react'

import PropTypes from 'prop-types'
import Store from '@eig-builder/core-utils/store'
import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'
import useFunctionAsState from '../../hooks/useFunctionAsState'
import { useSelector } from 'react-redux'
import MfeProvider, { ADDONS_MFE } from '@eig-builder/module-addons-mfe'
import UpgradeModal from 'core/components/upgrade-modal'
import useLogoLimit from 'hooks/useLogoLimit'
import { redirectToAccountManagerUpgradeUrl } from '@eig-builder/core-utils/helpers/redirect-to-am-upgrade-url'
import { useNavigate } from 'react-router'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'

// We have a special application service for the onboarding flow, this checks if you're in that service.
// !Only use process end here we don't want to normally use this since process is compile time
export const applicationHasOnboardingFlow = () => process.env.SC_ATTR === 'app-logo-builder-onboarding'

export const isUsingFullOnboardingFlow = () =>
  applicationHasOnboardingFlow() && getRuntimeConfig()._settings?.logomaker?.['allow-annoymous-usage']

export function userIsInNoAccountFlow() {
  const state = Store().getState()
  return (
    isUsingFullOnboardingFlow() ||
    (applicationHasOnboardingFlow() && !(state && state.auth && state.auth.isAuthenticated))
  )
}

const ApplicationContext = React.createContext({})

export function useApplicationContext() {
  const context = React.useContext(ApplicationContext)
  if (!context) {
    throw new Error('No context found for UseOnboardingProvider')
  }

  return context
}

const ApplicationConfig = ({ children, baseName }) => {
  const navigate = useNavigate()
  const [activeAuthFlow, activateAuthFlow] = useState(false)
  const [authenticationCallback, setAuthenticationCallBack] = useFunctionAsState()
  const [authenticatedReturnUrl, setAuthenticatedReturnUrl] = useState()
  const isAuthenticated = useSelector((state) => state.auth && state.auth.isAuthenticated)
  const authenticationReady = useSelector((state) => state.auth)
  const {
    showModal,
    setShowModal,
    goToCreateLogo: fnGoToCreateLogo,
    isOPN,
    limitationResponse,
    canCreateLogo,
    goToLogos: fnGoToLogos,
    shouldDisable
  } = useLogoLimit(baseName)
  const goToCreateLogo = () => fnGoToCreateLogo((path)=> goToWithHistory(navigate, path))
  const goToLogos = () => fnGoToLogos((path)=> goToWithHistory(navigate, path))
  const setAuthFlow = (value) => {
    activateAuthFlow(value)
  }

  useEffect(() => {
    if (showModal && limitationResponse?.data?.sku === 'LOGO_BUILDER_FREETRIAL') {
      redirectToAccountManagerUpgradeUrl(window.location.href)
    }
  }, [showModal, limitationResponse])

  return (
    <ApplicationContext.Provider
      value={{
        baseName,
        activeAuthFlow,
        setAuthFlow,
        authenticationCallback,
        setAuthenticationCallBack,
        authenticatedReturnUrl,
        setAuthenticatedReturnUrl,
        isAuthenticated,
        showModal,
        setShowModal,
        goToCreateLogo,
        isOPN,
        limitationResponse,
        canCreateLogo,
        goToLogos,
        shouldDisable
      }}
    >
      <MfeProvider type={ADDONS_MFE.AI_CONTENT_GENERATOR} version='ai-mfe@1'>
        {showModal && limitationResponse?.data?.sku !== 'LOGO_BUILDER_FREETRIAL' && (
          <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
        )}
        {!authenticationReady?.retrieving && children}
      </MfeProvider>
    </ApplicationContext.Provider>
  )
}

ApplicationConfig.propTypes = {
  baseName: PropTypes.string.isRequired,
  children: PropTypes.any
}

export default ApplicationConfig
