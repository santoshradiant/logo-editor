import { performFetch } from '@eig-builder/core-utils/fetch'
import { api } from '@eig-builder/core-utils/helpers/url-helper'

const TemporaryLogoClient = {
  getLogo: logoId => performFetch(api(`v1.0/temporary-logos/${logoId}/load`)),

  saveLogo: logo => performFetch(api('v1.0/temporary-logos/save'), { method: 'POST', body: logo }),

  updateLogo: (logoId, logo) => performFetch(api(`v1.0/temporary-logos/${logoId}/save`), { method: 'PUT', body: logo }),

  transferLogo: logoId => performFetch(api(`v1.0/temporary-logos/transfer/${logoId}`), { method: 'POST' })
}

export default TemporaryLogoClient
