import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import React, { memo, useState } from 'react'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import Text from '@eig-builder/module-localization'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid2'
import Inspirations from 'logomaker/config/inspirations'
import { LogoMakerEditor as LogoMaker } from '../advance-editor/logo-maker'
import PreviewRender from 'core/logo-maker/previewmaker/preview-maker'
import { useEditorContext } from 'logomaker/context/editor-context'
import { Navigation } from '@eig-builder/module-navigation'
import { useLogoById, useLogoUpdate } from 'hooks/useLogo'
import 'modules/editor/lang'
import { useNavigate } from 'react-router'

export const ComponentContainer = styled('div')`
  position: absolute;
  z-index: 11;
  top: 0;
  left: 0;
  background: white;
  width: 100%;
  height: 100%;
`

const InspirationContainer = styled('div')`
  margin-top: -16px;
  margin-right: auto;
`

const PreviewPage = ({ logoId, goBack }) => {
  const loadedLogoByFetch = useLogoById(logoId, false)

  const updateLogo = useLogoUpdate(false)

  return (
    <ComponentContainer>
      <LogoMaker
        LogoInstanceRequired
        selectedLogo={loadedLogoByFetch.data}
        saveLogo={(logo) => updateLogo.mutateAsync({ logoId: logoId, logo })}
        onChange={console.log}
      >
        <PreviewContentContainer logo={loadedLogoByFetch} goBack={goBack} />
      </LogoMaker>
    </ComponentContainer>
  )
}

PreviewPage.propTypes = {
  logoId: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

const Container = styled('div')`
  max-width: 1440px;
  margin: 0 auto;
`

const Nav = styled('div')`
  height: 64px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: ${({ theme }) => theme.palette.white.main};
  box-shadow: 1px 5px 12px 0 rgb(0 0 0 / 5%);
  font-weight: ${({ theme }) => theme.typography.h3.fontWeight};
  font-size: ${({ theme }) => theme.typography.h3.fontSize}px;
`

const NavigationWrapper = ({ children, goBack }) => {
  const navigate = useNavigate()
  const handleClick = () => {
    if (typeof goBack === 'function') {
      goBack?.()
    } else {
      navigate(-1)
    }
  }
  return (
    <>
      <Nav>
        <Navigation.BackButton onClick={handleClick} />
        <Text message='logoMaker.previewPage.back' />
      </Nav>
      <div>{children}</div>
    </>
  )
}
NavigationWrapper.propTypes = {
  children: PropTypes.any,
  history: PropTypes.object
}

const PreviewContent = ({ logo, goBack }) => {
  PreviewRender.clearGlobalSettings()

  const { logoInstance } = useEditorContext()

  const [inverted] = useState(false)
  const [scrolled] = useState(false)

  const firstFourInspirations = Inspirations.slice(0, 4)
  const restOfTheInspirations = Inspirations.slice(4, Inspirations.length)

  const isMobile = useIsMobile()

  const gridCols = isMobile ? 12 : 6
  const inspirationCols = isMobile ? 12 : 3

  return (
    <NavigationWrapper goBack={goBack}>
      {logo.data ? (
        <Container>
          <Grid container>
            <Grid  size={gridCols} style={{ padding: 16 }}>
              <LogoMaker.LogoArea scrolled={scrolled} inverted={inverted} logoInstance={logoInstance} preview />
            </Grid>
            <Grid  size={gridCols}>
              <LogoMaker.LogoInspiration
                logoInstance={logoInstance}
                logo={logo.data}
                inspirations={firstFourInspirations}
                cols={gridCols}
              />
            </Grid>
          </Grid>
          <InspirationContainer>
            <LogoMaker.LogoInspiration
              logoInstance={logoInstance}
              logo={logo.data}
              inspirations={restOfTheInspirations}
              cols={inspirationCols}
            />
          </InspirationContainer>
        </Container>
      ) : (
        <Box sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <CircularProgress />
        </Box>
      )}
    </NavigationWrapper>
  )
}

PreviewContent.propTypes = {
  logo: PropTypes.object
}

const PreviewContentContainer = memo(PreviewContent)

export default memo(PreviewPage)
