import LogoTransfer from './containers/logo-transfer'

import { CREATION } from '@eig-builder/core-utils/analytics/page-types'
import { LOGO } from '@eig-builder/core-utils/analytics/flow-types'

import { applicationHasOnboardingFlow } from 'modules/application-config'

const Routes = [
  {
    path: '/transfer/:logoId',
    component: LogoTransfer,
    pageType: CREATION,
    flowType: LOGO,
    isPublic: applicationHasOnboardingFlow()
  }
]

export default Routes
