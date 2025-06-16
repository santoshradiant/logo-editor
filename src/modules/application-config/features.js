import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'
import DownloadLimitations from 'modules/application-config/download-limitations'
import { useEditorContext } from 'logomaker/context/editor-context'
import LimitationsClient from '../../clients/limitations.client'
import { getProductUrl, getUrl, productNames, siteNames } from '@eig-builder/core-utils/helpers/url-helper'

export const isHostedBrand = () => getRuntimeConfig()._partnerId > 100

function redirectToBrandUrl (brandRedirectUrl, logoId) {
  window.location.assign(brandRedirectUrl.replace('{logo_id}', logoId))
}

const getCPHomeUrl = () => {
  if (getRuntimeConfig()._partnerId < 157) {
    // originally hosted brands needed the extra path but partners after 156 don't
    return getProductUrl(productNames.CONTROL_PANEL, 'home') + '/business/logomaker'
  }
  return getProductUrl(productNames.CONTROL_PANEL, 'home')
}

export const getHomeUrl = () => {
  let hostedUrl = getCPHomeUrl()
  try {
    hostedUrl = getProductUrl(productNames.CONTROL_PANEL, 'logo')
  } catch {
    hostedUrl = getCPHomeUrl()
  }
  if (hostedUrl === '' || hostedUrl === 'undefined') {
    hostedUrl = getCPHomeUrl()
  }

  return isHostedBrand() ? hostedUrl : getUrl(siteNames.MY)
}

export function partnerHasReadonlyBrandNameLock () {
  const runtime = getRuntimeConfig()
  const partnerHasReadonlyBrandNameLock = runtime._settings['logomaker-brandname-readme-lock']
  return partnerHasReadonlyBrandNameLock
}

export function logoIsReadonly (logo) {
  // eslint-disable-next-line camelcase
  return logo?.is_read_only === true
}

export function logoIsGeneratedLogo (logo) {
  // eslint-disable-next-line camelcase
  return logo?.is_placeholder === true
}

export function logoIsReadonlyBrandLock (logo, sku = null) {
  const limitBySku = sku === 'LOGO_BUILDER_FREETRIAL' || sku === 'LOGO_BUILDER_WEBSITEPLUS'
  return logoIsReadonly(logo) && (!!partnerHasReadonlyBrandNameLock() || limitBySku)
}

export const useDownload = () => {
  const { setUpgradeModalOpen, goDownloadLogo } = useEditorContext()
  const runtime = getRuntimeConfig()
  const brandRedirectUrl = runtime._settings['logomaker-downloadbutton-redirect-url']
  const upgradeModalEnabled = runtime._settings?.logomaker?.['enable-upgrade-modal']
  const isCreativeMail = runtime._brand === 'creativemail'

  return async (logoId, isMobile) => {
    const isAllowedToDownloadForFree = isHostedBrand() && brandRedirectUrl == null && !upgradeModalEnabled
    if (isAllowedToDownloadForFree) {
      goDownloadLogo(logoId, isMobile)
      return
    }

    const limitations = await LimitationsClient.getLogomakerLimitations(logoId)

    if (!(await DownloadLimitations.isAllowedToDownload(logoId, limitations))) {
      if (brandRedirectUrl != null) {
        redirectToBrandUrl(brandRedirectUrl, logoId)
      } else if (isCreativeMail || upgradeModalEnabled) {
        setUpgradeModalOpen(true)
      } else {
        await DownloadLimitations.unlockDownload(
          logoId,
          () => goDownloadLogo(logoId, isMobile),
          console.error,
          limitations
        )
      }
    } else {
      goDownloadLogo(logoId, isMobile)
    }
  }
}
