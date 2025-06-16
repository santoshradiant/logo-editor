import React, { useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import { useLocation, useNavigate, useParams } from 'react-router'
import Breakpoints from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import { LogoMaker } from '../../../logomaker'
import LogoBackButton from 'logomaker/components/logo-back-button'
import { useEditorContext } from 'logomaker/context/editor-context'
import { saveAs } from 'file-saver'
import '../lang'
import PreparingLogoPack from 'modules/editor/components/preparing-logo-pack'
import LogoPackReady from 'modules/editor/components/logo-pack-ready'
import NavigationWrapper, {
  Navigation,
  PageContent
} from '@eig-builder/module-navigation'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import { getHomeUrl, isHostedBrand } from 'modules/application-config/features'
import useLogoLimitations from 'hooks/useLogoLimitations'
import { AppSetupContext } from '@eig-builder/module-app-setup'
import { useLogoById, useLogoUpdate, useMarkLogoDownloaded } from 'hooks/useLogo'
import { ArrowBack } from '@mui/icons-material'

// const backToEditor = (history, match) => goToWithHistory(history, `/logo/editor/${match.params.logoId}/name`, true)
export const PreviewLogoContent = styled('div')`
  width: 40%;
  max-width: 400px;
  margin: auto;
  transition: all 1s;

  @media screen and (max-width: ${Breakpoints.MOBILE}px) {
    margin-top: 56px;
  }

  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    margin-top: 56px;
    width: 70%;
  }
  @media only screen and (orientation: landscape) and (max-height: 450px) and (max-width: 900px) {
    width: 53%;
    margin: 0 auto;

    .logo-editor-preview {
      padding-top: 14px;
    }
  }
  @media screen and (min-height: 760px) {
    &.closeupMode {
      /* margin-top: 20vh; */
      /* margin-bottom: 50vh; */
      width: 100%;
    }
  }
`
const PreviewPage = () => {
  const { isOPN } = useContext(AppSetupContext)
  const params = useParams()
  
  const loadedLogoByFetch = useLogoById(params.logoId)
  const navigate = useNavigate()
  const location = useLocation()
  const updateLogo = useLogoUpdate()

  const goBack = React.useCallback(() => {
    const isFromEditor = location?.search?.includes?.('from_editor=true')

    if (isFromEditor) {
      navigate(-1)
    } else {
      if (isOPN) {
        goToWithHistory(navigate, `${window.location.origin}/logo`, true)
      } else {
        goToWithHistory(navigate, getHomeUrl())
      }
    }
  }, [location])

  useEffect(() => {
    window.navigationState.drawer.next(false)
    window.navigationState.header.next(false)
  }, [])

  return (
    <NavigationWrapper>
      <Navigation.DetailBar>
        <Navigation.LeftAlign>
          <LogoBackButton icon={<ArrowBack />} onClick={goBack} />
        </Navigation.LeftAlign>
        <Navigation.CenterAlign />
        <Navigation.RightAlign>{/* <Navigation.AccountBox /> */}</Navigation.RightAlign>
      </Navigation.DetailBar>
      <PageContent>
        <LogoMaker
          LogoInstanceRequired
          selectedLogo={loadedLogoByFetch.data}
          saveLogo={(logo, logoId) => updateLogo.mutateAsync({ logoId, logo })}
          onChange={console.log}
        >
          <PreviewContentContainer logo={loadedLogoByFetch} />
        </LogoMaker>
      </PageContent>
    </NavigationWrapper>
  )
}

const PreviewContent = ({ logo }) => {
  const { isOPN } = useContext(AppSetupContext)
  const { logoInstance } = useEditorContext()
  const navigate = useNavigate()
  const limitationResponse = useLogoLimitations(logo)

  // Mark logo as been downloaded
  const markLogo = useMarkLogoDownloaded()

  logoInstance.setColorMode(0)

  const [logoPack, setLogoPack] = React.useState()

  const startDownload = React.useCallback(() => {
    if (logoPack == null) {
      return
    }

    const { blob, zipName } = logoPack
    markLogo.mutate(logo.data.id)
    saveAs(blob, zipName)

    if (isHostedBrand() && !isOPN) {
      setTimeout(() => goToWithHistory(navigate, getHomeUrl()), 100)
    }
  }, [logoPack])

  if (limitationResponse.isFetching || !limitationResponse.data) {
    return null
  }

  return logoPack != null ? (
    <LogoPackReady onDownload={startDownload} logoInstance={logoInstance} />
  ) : (
    <PreparingLogoPack
      logoInstance={logoInstance}
      limitations={limitationResponse?.data?.limitations}
      onPrepared={setLogoPack}
    />
  )
}

PreviewContent.propTypes = {
  logo: PropTypes.object
}

const PreviewContentContainer = React.memo(PreviewContent)

export default React.memo(PreviewPage)
