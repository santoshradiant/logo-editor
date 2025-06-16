import { isAllowed, unlock, unlockMultiple } from '@eig-builder/core-utils/helpers/limitation-helper'
import LimitationsClient from '../../clients/limitations.client'

const downloadLimitationKeys = [
  'logo_download_low_res',
  'logo_download_standard_files',
  'logo_download_vector_files',
  'logo_download_social_media_files',
  'logo_download_app_icon_files'
]

const getSuccessUrl = logoId => `${new URL(window.location.href).origin}/logo/editor/${logoId}/download`

const DownloadLimitations = {
  getSuccessUrl,
  isAllowedToDownload: async (logoId, limitations) =>
    isAllowed({
      value: downloadLimitationKeys,
      limitationKey: downloadLimitationKeys,
      limitationsResponse: limitations ?? (await LimitationsClient.getLogomakerLimitations(logoId))
    }),
  unlockDownload: async (logoId, onUnlock, onError, limitations) => {
    unlockMultiple({
      resourceId: logoId,
      limitationsToUnlock: downloadLimitationKeys,
      limitations: limitations ?? (await LimitationsClient.getLogomakerLimitations(logoId)),
      success: onUnlock,
      successUrl: getSuccessUrl(logoId),
      error: onError,
      errorUrl: window.location.href,
      extraInfo: {
        purchaseOrigin: 'logo-download-button',
        source: 'logomaker'
      }
    })
  },
  unlockCreativeMailDownload: async (logoId, onUnlock, onError) => {
    unlock({
      value: 4,
      limitationKey: 'site',
      limitationsResponse: await LimitationsClient.getControlPanelLimitations(logoId),
      success: onUnlock,
      successUrl: getSuccessUrl(logoId),
      error: onError,
      errorUrl: window.location.href,
      extraInfo: {
        purchaseOrigin: 'logo-download-button'
      }
    })
  }
}

export default DownloadLimitations
