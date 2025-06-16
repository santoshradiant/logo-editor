import { api } from '@eig-builder/core-utils/helpers/url-helper'
import { performFetch } from '@eig-builder/core-utils/fetch'
import AuthUjwtHelper from 'helpers/auth-ujwt-helper'

/*
 * Swagger: https://lm-api.websitebuilder.latest.wzdev.co/swagger/index.html
 */
const LogoClient = {
  getLogos: async () =>
    performFetch(api('v1.0/logos/list?include_logo=true'), {
      headers: { Authorization: `Bearer ${await AuthUjwtHelper.getToken()}` }
    }),

  getLogo: async logoId =>
    performFetch(api(`v1.0/logos/${logoId}/load`), {
      headers: { Authorization: `Bearer ${await AuthUjwtHelper.getToken()}` }
    }),

  saveLogo: async logo =>
    performFetch(api('v1.0/logos/save'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${await AuthUjwtHelper.getToken()}` },
      body: logo
    }),

  updateLogo: async (logoId, logo) =>
    performFetch(api(`v1.0/logos/${logoId}/save`), {
      method: 'POST',
      body: logo,
      headers: { Authorization: `Bearer ${await AuthUjwtHelper.getToken()}` }
    }),

  deleteLogo: logoId => performFetch(api(`v1.0/logos/${logoId}/delete`), { method: 'DELETE' }),

  duplicateLogo: logoId => performFetch(api(`v1.0/logos/${logoId}/duplicate`), { method: 'POST' }),

  markLogoDownloaded: async logoId =>
    performFetch(api(`v1.0/logos/${logoId}/downloaded`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${await AuthUjwtHelper.getToken()}` }
    }),

  getVotes: () => performFetch(api('v1.0/votes/list')),

  deleteLogoVote: () => performFetch(api('v1.0/votes/delete')),

  downloadLogoFont: async (fontUrl, filename) => {
    try {
      const response = await window.fetch(fontUrl)
      const blob = await response.blob()
      const urlObject = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = urlObject
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(urlObject)
    } catch (error) {
      console.error(`Error downloading file: ${error.message}`)
    }
  }
}

export default LogoClient
