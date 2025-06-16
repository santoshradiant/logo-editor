import React, { useCallback, useEffect, useRef } from 'react'
import { SingleSpaContext } from 'single-spa-react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import isNil from 'lodash/isNil'
import get from 'lodash/get'

import Breakpoints, { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import useLimitation from '@eig-builder/core-utils/hooks/useLimitation'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import Stepper, {
  StepContext,
  ContextProviderComponent as StepperContextProviderComponent,
  useStepperContext
} from '@eig-builder/module-stepper'

import BottomNavWithProgress from 'modules/onboarding/components/bottom-nav-with-progress'
import { getHomeUrl, isHostedBrand } from 'modules/application-config/features'
import useFreeFlow from 'hooks/useFreeFlow'

import OnboardingProviderContext, { useOnboardingContext } from '../context/onboarding-context'
import useLogoMakerStepsInFlow from './logomaker-steps.js'
import Selection from '../components/selection'
import useLogoLimit from 'hooks/useLogoLimit'

import './lang'
import { useNavigate } from 'react-router'
export const LOGO_MAKER_ONBOARDING_BASE_PATH = '/onboarding'

const removeLocalStorageKey = () => {
  if (window.localStorage && window.localStorage.getItem('LogomakerForm')) {
    window.localStorage.removeItem('LogomakerForm')
  }
}

const SidebarWrapper = styled('div')`
  position: fixed;
  .route-section {
    position: inherit;
    width: 100%;
  }
`

const NavWrapper = styled('div')`
  background: ${({ theme }) => theme.palette.white.main};
  width: 100vw;
  position: fixed;
  bottom: 0;
  height: 60px;
  z-index: 4;
`

const StyledHeader = styled('div')`
  flex: 0 0 auto;
  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    z-index: 1;
    width: 100vw;
    height: 100%;
    box-shadow: none;
    .route-section {
      margin-bottom: 60px;
    }
  }
  @media screen and (min-width: ${Breakpoints.TABLET}px) {
    align-self: flex-start;
    width: 400px;
    height: 100vh;
    background: ${({ theme }) => theme.palette.white.main};
    box-shadow: ${({ theme }) => theme.shadows[3]};
  }
`

const SelectionContainer = styled('div')`
  display: flex;
  width: 100vw;

  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    flex-direction: column;
    background: ${({ theme }) => theme.palette.white.main};
  }
`

const ScrollContainer = styled('div')`
  height: 100vh;
  overflow-y: auto;
  flex-grow: 1;
  & > div > div {
    justify-content: space-around !important;
  }
`

const StepperWrapper = (props) => {
  const context = React.useContext(SingleSpaContext)
  const { isFromEditor, goBackToSiteEditor } = useOnboardingContext()
  const { navigateToPreviousStep, shouldDisplayBackIcon } = useStepperContext()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const { allSteps, firstStep } = useLogoMakerStepsInFlow([])
  const isInParcel = context.properties != null
  const [limitationResponse] = useLimitation('controlpanel')

  const { isOPN, limitationResponse: limitResponse, canCreateLogo, goToLogos } = useLogoLimit()

  useEffect(() => {
    if (limitResponse?.data && isOPN) {
      !canCreateLogo() && goToLogos()
    }
  }, [isOPN, limitResponse])

  const onCloseClick = () => {
    removeLocalStorageKey()
    if (isInParcel) {
      context.properties.onClose()
    } else {
      const allNavLimited = get(limitationResponse.data, 'limitations.nav_all.value')
      const partnerRedirectUrl = get(limitationResponse.data, 'limitations.top_shell.settings.redirect_url')
      const partnerIntegration = allNavLimited && partnerRedirectUrl

      if (isFromEditor()) {
        return goBackToSiteEditor()
      }
      if (isOPN) {
        return goToWithHistory(navigate, '/logo', true)
      }
      // this will also cover jarvis brands (or any brand with partnerID > 100)
      if (isHostedBrand()) {
        return goToWithHistory(navigate, getHomeUrl())
      }
      if (partnerIntegration) {
        return window.location.assign(partnerRedirectUrl)
      }
      goToWithHistory(navigate, '/logo', true)
    }
  }
  
  return (
    <StyledHeader className='d-flex flex-column align-content-center justify-content-flex-start'>
      <Stepper
        startPath={firstStep.path}
        totalSteps={allSteps.length}
        steps={allSteps}
        basePath={LOGO_MAKER_ONBOARDING_BASE_PATH}
        onClose={onCloseClick}
      >
        <Stepper.Container>
          <Stepper.Header>
            {shouldDisplayBackIcon ? <Stepper.BackIcon onClick={navigateToPreviousStep} /> : null}
            {!limitationResponse?.isLoading && limitationResponse?.isSuccess && (
              <StepContext.Consumer>
                {({ displayExitIcon }) => (
                  <div className='exit-icon-container'>
                    {displayExitIcon && (
                      <IconButton key='close' aria-label='close' onClick={onCloseClick}>
                        <CloseIcon />
                      </IconButton>
                    )}
                  </div>
                )}
              </StepContext.Consumer>
            )}
          </Stepper.Header>
          <Stepper.Content>{() => allSteps}</Stepper.Content>
          {isMobile && (
            <NavWrapper>
              <BottomNavWithProgress />
            </NavWrapper>
          )}
        </Stepper.Container>
      </Stepper>
    </StyledHeader>
  )
}

const PageContent = () => {
  const { logoAmount, setLogoAmount, windowItems } = useOnboardingContext()
  const contentRef = useRef()

  const loadMore = () => {
    setLogoAmount((prev) => prev + windowItems())
  }

  const onLoadMore = (e) => {
    const { scrollHeight, scrollTop, clientHeight } = e.target
    if (scrollTop + clientHeight > scrollHeight - 10) {
      loadMore()
    }
  }

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', onLoadMore)
    }
    return () => contentRef.current?.removeEventListener('scroll', onLoadMore)
  }, [contentRef.current])
  return (
    <SidebarWrapper>
      <SelectionContainer>
        <StepperWrapper />
        <ScrollContainer ref={contentRef}>
          <Selection maxItems={logoAmount} setMaxItems={setLogoAmount} windowItems={() => windowItems()} />
        </ScrollContainer>
      </SelectionContainer>
    </SidebarWrapper>
  )
}

const StepperOnboarding = (props) => {
  const { createLogoOnServer, postState, onboardingInfo } = useOnboardingContext()
  const { allSteps } = useLogoMakerStepsInFlow([])
  const navigate = useNavigate()

  const redirectUrl = postState.data ? `/logo/transfer/${postState.data.id}` : '/logo'

  const myRedirectCallback = useCallback(() => {
    navigate(redirectUrl)
  }, [ redirectUrl])

  const [triggerFreeFlowAction] = useFreeFlow(window.location.origin + redirectUrl, myRedirectCallback)

  useEffect(() => {
    if (postState.data) {
      if (!postState.data?.id) {
        if (window != null) {
          window.postMessage(
            { type: 'fetch_notification', message: postState.data, persistent: false },
            window.document.origin
          )
          return
        }
      }
      const siteId = onboardingInfo && onboardingInfo.site_id
      // Trigger action, if the trigger doesn;t fire the popup then go to my logos
      const continueBaseUrl = getRuntimeConfig()._settings?.logomaker?.['allow-annoymous-usage'] ? '' : ''

      triggerFreeFlowAction('freeflow', () =>
        navigate(`${continueBaseUrl}/editor/${postState.data.id}/name${!isNil(siteId) ? `?siteId=${siteId}` : ''}`)
      )
    }
    // eslint-disable-next-line
  }, [postState.data,  onboardingInfo])

  return (
    <StepperContextProviderComponent
      steps={allSteps}
      onClose={() => {
        removeLocalStorageKey()
        createLogoOnServer()
      }}
    >
      {props.children}
    </StepperContextProviderComponent>
  )
}

StepperOnboarding.propTypes = {
  children: PropTypes.node.isRequired
}


const StatefulOnboarding = () => {
  return (
    <OnboardingProviderContext>
      <StepperOnboarding>
        <PageContent />
      </StepperOnboarding>
    </OnboardingProviderContext>
  )
}

export default StatefulOnboarding
