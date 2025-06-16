import { useDownload } from 'modules/application-config/features'
import mockRuntimeConfig from '../../../__mocks__/mockRuntimeConfig'
import mockWindowLocation from '../../../__mocks__/mockWindowLocation'
import EditorContext from 'logomaker/context/editor-context'
import DownloadLimitations from 'modules/application-config/download-limitations'
import LimitationsClient from '../../clients/limitations.client'
import { renderHook } from '@testing-library/react-hooks'
import React from 'react'

jest.mock('modules/application-config/download-limitations')
jest.mock('../../clients/limitations.client')

describe('useDownload', () => {
  const goDownloadLogo = jest.fn()
  const setUpgradeModalOpen = jest.fn()

  const runtimeConfig = mockRuntimeConfig()
  mockWindowLocation()

  beforeEach(() => {
    goDownloadLogo.mockClear()
    setUpgradeModalOpen.mockClear()

    Object.values(DownloadLimitations).forEach(mockFunction => mockFunction.mockClear())
    Object.values(LimitationsClient).forEach(mockFunction => mockFunction.mockClear())
  })

  const logoId = 123
  const isMobile = false
  const downloadLimitations = ['logo_download_limitation_1', 'logo_download_limitation_2']

  const testUseDownload = async (...args) => {
    const { result } = renderHook(useDownload, {
      wrapper: props => <EditorContext.Provider value={{ setUpgradeModalOpen, goDownloadLogo }} {...props} />
    })

    await result.current(...args)
  }

  it('should use runtime redirect setting', async () => {
    LimitationsClient.getLogomakerLimitations = jest.fn().mockResolvedValue(downloadLimitations)
    DownloadLimitations.isAllowedToDownload = jest.fn().mockResolvedValue(false)

    runtimeConfig.mock({
      _settings: {
        'logomaker-downloadbutton-redirect-url': 'http://app.brand.com/logo/download?logoId={logo_id}'
      }
    })

    await testUseDownload(logoId, isMobile)

    expect(LimitationsClient.getLogomakerLimitations).toHaveBeenCalledWith(logoId)
    expect(DownloadLimitations.isAllowedToDownload).toHaveBeenCalledWith(logoId, downloadLimitations)
    expect(setUpgradeModalOpen).not.toHaveBeenCalled()
    expect(DownloadLimitations.unlockDownload).not.toHaveBeenCalled()
    expect(window.location.assign).toHaveBeenCalledWith('http://app.brand.com/logo/download?logoId=123')
    expect(goDownloadLogo).not.toHaveBeenCalled()
  })

  it('should go to download page', async () => {
    LimitationsClient.getLogomakerLimitations = jest.fn().mockResolvedValue(downloadLimitations)
    DownloadLimitations.isAllowedToDownload = jest.fn().mockResolvedValue(true)

    runtimeConfig.mock({ _settings: {} })

    await testUseDownload(logoId, isMobile)

    expect(LimitationsClient.getLogomakerLimitations).toHaveBeenCalledWith(logoId)
    expect(DownloadLimitations.isAllowedToDownload).toHaveBeenCalledWith(logoId, downloadLimitations)
    expect(DownloadLimitations.unlockDownload).not.toHaveBeenCalled()
    expect(window.location.assign).not.toHaveBeenCalled()
    expect(goDownloadLogo).toHaveBeenCalledWith(logoId, isMobile)
  })

  it('should unlock if ctct and upgrade modal is enabled', async () => {
    LimitationsClient.getLogomakerLimitations = jest.fn().mockResolvedValue(downloadLimitations)
    DownloadLimitations.isAllowedToDownload = jest.fn().mockResolvedValue(false)

    runtimeConfig.mock({
      _brand: 'constantcontact',
      _settings: {
        logomaker: { 'enable-upgrade-modal': false }
      }
    })

    await testUseDownload(logoId, isMobile)

    expect(LimitationsClient.getLogomakerLimitations).toHaveBeenCalledWith(logoId)
    expect(DownloadLimitations.isAllowedToDownload).toHaveBeenCalledWith(logoId, downloadLimitations)
    expect(DownloadLimitations.unlockDownload).toHaveBeenCalled()
    expect(window.location.assign).not.toHaveBeenCalled()
    expect(goDownloadLogo).not.toHaveBeenCalled()
  })

  it('should unlock', async () => {
    LimitationsClient.getLogomakerLimitations = jest.fn().mockResolvedValue(downloadLimitations)
    DownloadLimitations.isAllowedToDownload = jest.fn().mockResolvedValue(false)

    runtimeConfig.mock({ _settings: {} })

    await testUseDownload(logoId, isMobile)

    expect(LimitationsClient.getLogomakerLimitations).toHaveBeenCalledWith(logoId)
    expect(DownloadLimitations.isAllowedToDownload).toHaveBeenCalledWith(logoId, downloadLimitations)
    expect(DownloadLimitations.unlockDownload).toHaveBeenCalled()
    expect(window.location.assign).not.toHaveBeenCalled()
    expect(goDownloadLogo).not.toHaveBeenCalledWith(logoId, isMobile)
  })

  it('should open upgrade modal for Creative Mail', async () => {
    LimitationsClient.getLogomakerLimitations = jest.fn().mockResolvedValue(downloadLimitations)
    DownloadLimitations.isAllowedToDownload = jest.fn().mockResolvedValue(false)

    runtimeConfig.mock({
      _brand: 'creativemail',
      _settings: {}
    })

    await testUseDownload(logoId, isMobile)

    expect(LimitationsClient.getLogomakerLimitations).toHaveBeenCalledWith(logoId)
    expect(DownloadLimitations.isAllowedToDownload).toHaveBeenCalledWith(logoId, downloadLimitations)
    expect(setUpgradeModalOpen).toHaveBeenCalledWith(true)
    expect(DownloadLimitations.unlockDownload).not.toHaveBeenCalled()
    expect(window.location.assign).not.toHaveBeenCalled()
    expect(goDownloadLogo).not.toHaveBeenCalledWith(logoId, isMobile)
  })

  it('should open upgrade modal for Web.com', async () => {
    LimitationsClient.getLogomakerLimitations = jest.fn().mockResolvedValue(downloadLimitations)
    DownloadLimitations.isAllowedToDownload = jest.fn().mockResolvedValue(false)

    runtimeConfig.mock({
      _brand: 'networksolutions',
      _settings: {
        logomaker: { 'enable-upgrade-modal': true }
      }
    })

    await testUseDownload(logoId, isMobile)

    expect(LimitationsClient.getLogomakerLimitations).toHaveBeenCalledWith(logoId)
    expect(DownloadLimitations.isAllowedToDownload).toHaveBeenCalledWith(logoId, downloadLimitations)
    expect(setUpgradeModalOpen).toHaveBeenCalledWith(true)
    expect(DownloadLimitations.unlockDownload).not.toHaveBeenCalled()
    expect(window.location.assign).not.toHaveBeenCalled()
    expect(goDownloadLogo).not.toHaveBeenCalledWith(logoId, isMobile)
  })
})
