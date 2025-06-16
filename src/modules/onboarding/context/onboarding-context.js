import React, { useCallback, useEffect, useState, useContext } from 'react'
import { getUrl, siteNames } from '@eig-builder/core-utils/helpers/url-helper'
import { useQueryClient } from '@tanstack/react-query'

import LogoInstance from 'core/logo-maker/logo-instance'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import initialInstance from './initial-logo-instance'
import isNil from 'lodash/isNil'
import useLocalStorage from 'hooks/useLocalStorage'
import { userIsInNoAccountFlow } from 'modules/application-config'
import TemporaryLogoClient from '../../../clients/temporary-logo.client'
import LogoClient from '../../../clients/logo.client'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import BootstrapperContext from '@eig-builder/module-bootstrapper/contexts/BootstrapperContext'
import { useLocation, useNavigate, useParams } from 'react-router'

// const PNG_WIDTH = 1200
// const PNG_HEIGHT = 800

const OnboardingContext = React.createContext({})

const useOnboardingContext = () => {
  const context = React.useContext(OnboardingContext)
  if (!context) {
    throw new Error('No context found for UseOnboardingProvider')
  }

  return context
}
const LogomakerTempSaveKey = 'LogomakerForm'

const OnboardingProviderContext = ({ children }) => {
  const { analyticsService } = useContext(BootstrapperContext)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const windowItems = useCallback(() => Math.round(window.innerHeight / 220) * (isMobile ? 4 : 3), [isMobile])
  const queryClient = useQueryClient()

  const [continueButtonActive, setContinueButtonActive] = useState(false)
  const [isLoadingSaveLogo, setSaveLogoLoading] = useState(false)
  const [template, selectTemplate] = useState(null)
  const [onboardingTemplate, setOnboardingTemplate] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [onboardingInfo, setOnboardingInfoState] = useState(null)
  const [postState, setPostState] = useState({})
  const [logoId] = useState(get(params, 'logoId'))
  const [logoAmount, setLogoAmount] = useState(windowItems())

  const [tempSaveValues, setTempSaveValues] = useLocalStorage(LogomakerTempSaveKey)

  const [stepValues, setStepValues] = useState(
    tempSaveValues || {
      Create: {}
    }
  )

  const resetLogoAmount = () => {
    setLogoAmount(windowItems())
  }

  const saveStepValues = (values, step) => {
    const newState = {
      ...stepValues,
      [step]: {
        ...stepValues[step],
        ...values
      }
    }
    setStepValues(newState)
    setTempSaveValues(newState)
  }

  const [instance, setInstance] = useState(
    new LogoInstance(
      {
        ...initialInstance,
        text: {
          brandName: stepValues.Create.brandName || 'BRAND NAME',
          slogan: stepValues.Create.slogan || ''
        }
      },
      null
    )
  )
  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const brandName = query.get('brandName')
    const slogan = query.get('slogan')

    if (brandName == null || slogan == null) {
      return
    }

    saveStepValues({ brandName, slogan }, 'Create')
  }, [])

  const siteId = get(onboardingInfo, 'site_id')

  const goBackToSiteEditor = useCallback(() => {
    goToWithHistory(navigate,  getUrl(siteNames.RESPONSIVE_EDITOR, `/site/${siteId}`))
  }, [siteId])

  const isFromEditor = useCallback(() => {
    return !isNil(siteId)
  }, [siteId])

  const createLogoOnServer = () => {
    if (instance) {
      const details = {
        name: instance.templateData.text.brandName,
        svg: instance.getSVG(),
        logo: JSON.stringify(instance.templateData),
        preview_image_data: previewImage
      }
      // instance.getPngPromise(PNG_WIDTH, PNG_HEIGHT).then(pngData => {
      // details['preview_image_data'] = pngData
      // postLogo(details)
      const useTemporary = userIsInNoAccountFlow()
      const inUsingPreGeneratedId = new URLSearchParams(window.location.search).get('logoId')
      const saveLogo = useTemporary ? TemporaryLogoClient.saveLogo : LogoClient.saveLogo
      setTempSaveValues(null)

      if (!!inUsingPreGeneratedId && inUsingPreGeneratedId !== '') {
        LogoClient.updateLogo(inUsingPreGeneratedId, details).then(data => {
          analyticsService?.trackEvent('logo-created', { logoName: details?.name })
          queryClient.invalidateQueries('logos')
          queryClient.clear()

          setPostState({ data }) //eslint-disable-line
          setSaveLogoLoading(false)
        })
      } else {
        saveLogo(details).then(data => {
          analyticsService?.trackEvent('logo-created', { logoName: details?.name })
          queryClient.invalidateQueries('logos')
          setPostState({ data }) //eslint-disable-line
          setSaveLogoLoading(false)
        })
      }
    }
  }

  const setOnboardingInfo = useCallback(
    data => {
      let extraData = {}
      if (data.colors) {
        extraData = {
          color: {
            palette: [...data.colors]
          }
        }
      }
      instance.update({
        text: {
          brandName: data.brand,
          slogan: data.slogan
        },
        ...extraData
      })
      setOnboardingInfoState(data)
    },
    [instance]
  )
  return (
    <OnboardingContext.Provider
      value={{
        continueButtonActive,
        setContinueButton: setContinueButtonActive,
        setStepValues,
        setOnboardingInfoState,
        stepValues,
        template,
        selectTemplate,
        saveStepValues,
        setSaveLogoLoading,
        isLoadingSaveLogo,
        instance,
        setInstance,
        previewImage,
        setPreviewImage,
        postState,
        setOnboardingTemplate,
        onboardingTemplate,
        createLogoOnServer,
        setOnboardingInfo,
        onboardingInfo,
        goBackToSiteEditor,
        isFromEditor,
        logoId,
        logoAmount,
        setLogoAmount,
        resetLogoAmount,
        windowItems
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

OnboardingProviderContext.propTypes = {
  children: PropTypes.any.isRequired,
}

export { useOnboardingContext }

export default OnboardingProviderContext
