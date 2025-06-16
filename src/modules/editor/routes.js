import { CREATION } from '@eig-builder/core-utils/analytics/page-types'
import { LOGO } from '@eig-builder/core-utils/analytics/flow-types'
import { withShellEmptyNavigation } from '@eig-builder/module-navigation'

import { isUsingFullOnboardingFlow } from 'modules/application-config'
import EditorPage from './containers/editor-page'

const Routes = () => [
  {
    path: '/editor/:logoId/preview',
    component: withShellEmptyNavigation(() => import('./containers/logo-preview')),
    pageType: CREATION,
    flowType: LOGO,
    isPublic: isUsingFullOnboardingFlow()
  },
  {
    path: '/editor/:logoId/download',
    component: withShellEmptyNavigation(() => import('./containers/logo-download-page')),
    pageType: CREATION,
    flowType: LOGO,
    isPublic: isUsingFullOnboardingFlow()
  },
  {
    path: '/editor/:logoId/:segment?',
    component: EditorPage,
    pathToLeaveFocusView: '/my',
    pageType: CREATION,
    flowType: LOGO,
    isPublic: isUsingFullOnboardingFlow()
  }
]
export default Routes
