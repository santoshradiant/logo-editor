import React, { lazy } from 'react'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import Text from '@eig-builder/module-localization'
import './lang'

const InfoStep = lazy(() => import('../components/create'))
const FontAndLayoutStep = lazy(() => import('../components/font-selection'))

const useLogoMakerStepsInFlow = (intitialState) => {
  const isMobile = useIsMobile()

  const TRANSLATION = (step, title) => `modules.onboarding.steps.${step}.${title}`

  const getTitles = (page) => ({
    title: <Text message={TRANSLATION(page, 'header2')} />,
    subtitle: <Text message={TRANSLATION(page, isMobile ? 'subtitleMobileRebrand' : 'subtitle2Rebrand')} />
  })

  const INFO_STEP = {
    component: InfoStep,
    data: getTitles('create'),
    path: '1'
  }

  const FONT_AND_LAYOUT_STEP = {
    component: FontAndLayoutStep,
    data: getTitles('variations'),
    path: '2'
  }

  const LOGO_MAKER_STEPS_IN_FLOW = isMobile ? [INFO_STEP, FONT_AND_LAYOUT_STEP] : [INFO_STEP]

  const FIRST_STEP = LOGO_MAKER_STEPS_IN_FLOW[0]

  return {
    allSteps: LOGO_MAKER_STEPS_IN_FLOW || intitialState,
    firstStep: FIRST_STEP || intitialState
  }
}

export default useLogoMakerStepsInFlow
