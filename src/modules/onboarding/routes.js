import { CREATION } from '@eig-builder/core-utils/analytics/page-types'
import { LOGO } from '@eig-builder/core-utils/analytics/flow-types'
import { withShellEmptyNavigation } from '@eig-builder/module-navigation'
import { applicationHasOnboardingFlow } from '../application-config'

const StatefulOnboardingPage = withShellEmptyNavigation(() => import('./containers/stateful-onboarding'))

const createRoute = (path, component, pageType, flowType, isPublic) => {
  return {
    path,
    component,
    pageType,
    flowType,
    isPublic: applicationHasOnboardingFlow()
  }
}

const Routes = [
  // New onboarding flow
  createRoute('/onboarding/:currentStep/:logoId', StatefulOnboardingPage, CREATION, LOGO, true),
  createRoute('/onboarding', StatefulOnboardingPage, CREATION, LOGO, true)
]

export default Routes
