import { getAccountLimitations, RESOURCE_TYPES } from '@eig-builder/core-utils/hooks/useAccountLimitations'
import { api } from '@eig-builder/core-utils/helpers/url-helper'
import { performFetch } from '@eig-builder/core-utils/fetch'
import AuthUjwtHelper from 'helpers/auth-ujwt-helper'

const LimitationsClient = {
  getControlPanelLimitations: logoId => getAccountLimitations('controlpanel', RESOURCE_TYPES.Logo, logoId),
  getLogomakerLimitations: logoId => performFetch(api(`v1.0/limitation?resourceId=${logoId}`)),
  getLogomakerAccountLimitations: async () =>
    performFetch(api('v2.0/limitation'), {
      headers: { Authorization: `Bearer ${await AuthUjwtHelper.checkAuth()}` },
      dontShowErrorsInNotificationBar: true
    }),
  getAccountInfo: () => performFetch(api('v1.0/accounts/info', 'auth')),
  getProvisioningStatus: () => performFetch(api('v1.0/limitation/provisioning-status'))
}

export default LimitationsClient
