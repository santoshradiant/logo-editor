import { withShellDefaultNavigation } from '@eig-builder/module-navigation'

import { MANAGE } from '@eig-builder/core-utils/analytics/page-types'
import { LOGO } from '@eig-builder/core-utils/analytics/flow-types'

const MyLogos = withShellDefaultNavigation(() => import('./components/my-logos-page'))

const createRoute = (path, component, pageType, flowType, isPublic = false) => ({
  path,
  component,
  pageType,
  flowType,
  isPublic
})

const Routes = [createRoute('/', MyLogos, MANAGE, LOGO)]

export default Routes
