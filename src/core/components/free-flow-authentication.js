import React from 'react'

import { EmbeddedAuthForm, getProps } from '@eig-builder/module-authentication-auth-form'
import AuthenticationContext from '@eig-builder/module-authentication/contexts/AuthenticationContext'

import { useQuery } from '@tanstack/react-query'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import limitation from 'clients/limitations.client'
import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'

import { useApplicationContext } from '../../modules/application-config/index'

const AuthModal = () => {
  const { authenticationCallback, authenticatedReturnUrl } = useApplicationContext()
  const authContext = React.useContext(AuthenticationContext)
  const isMobile = useIsMobile()
  const { data } = useQuery({
    queryFn: () => limitation.getAccountInfo(),
    queryKey: ['accounts-info'],
    refetchOnWindowFocus: false
  })

  return (
    <Dialog open fullScreen={isMobile}>
      <DialogContent>
        <EmbeddedAuthForm
          {...getProps({
            useAccountsApi: getRuntimeConfig()._settings.loginsignup?.useaccountsapi || false
          })}
          startPage='signup'
          landerType='logo-flow'
          challengeRecaptcha={false}
          isEea={data && data.is_eea}
          authenticatedReturnUrl={authenticatedReturnUrl}
          authenticatedSuccess={async () => {
            await authContext.updateAuthentication()
            authenticationCallback()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

const FreeFlowAuthenticationModal = () => {
  const { activeAuthFlow } = useApplicationContext()

  return activeAuthFlow && <AuthModal />
}
export default FreeFlowAuthenticationModal
