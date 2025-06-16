import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import React, { memo, useState } from 'react'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import Text from '@eig-builder/module-localization'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Inspirations from 'logomaker/config/inspirations'
import { LogoMaker } from 'logomaker'
import PreviewRender from 'core/logo-maker/previewmaker/preview-maker'
import { useEditorContext } from 'logomaker/context/editor-context'
import { Navigation } from '@eig-builder/module-navigation'
import { useLogoById, useLogoUpdate } from 'hooks/useLogo'
import 'modules/editor/lang'
import { useNavigate, useParams } from 'react-router'

const InspirationContainer = styled(Grid)`
  margin-top: 16px;
  margin-right: auto;
`

const PreviewPage = () => {
  const params = useParams()
  const loadedLogoByFetch = useLogoById(params.logoId)

  const updateLogo = useLogoUpdate()

  return (
    <LogoMaker
      LogoInstanceRequired
      selectedLogo={loadedLogoByFetch.data}
      saveLogo={(logo) => updateLogo.mutateAsync({ logoId: params.logoId, logo })}
      onChange={console.log}
    >
      <PreviewContentContainer logo={loadedLogoByFetch} />
    </LogoMaker>
  )
}

PreviewPage.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

const Container = styled('div')`
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px;
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

const NavigationWrapper = ({ children }) => {
  const navigate = useNavigate()
  return (
    <>
      <Nav>
        <Navigation.BackButton onClick={() => navigate(-1)} />
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

const PreviewContent = ({ logo }) => {
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
    <NavigationWrapper>
      {logo.data ? (
        <Container>
          <Grid container spacing={3}>
            <Grid  size={gridCols}>
              <LogoMaker.LogoArea scrolled={scrolled} inverted={inverted} logoInstance={logoInstance} preview />
            </Grid>
            <Grid  size={{ xs: gridCols }}>
              <LogoMaker.LogoInspiration
                logoInstance={logoInstance}
                logo={logo.data}
                inspirations={firstFourInspirations}
                cols={gridCols}
              />
            </Grid>
          </Grid>
          <InspirationContainer container>
            <Grid  size={12}>
              <LogoMaker.LogoInspiration
                logoInstance={logoInstance}
                logo={logo.data}
                inspirations={restOfTheInspirations}
                cols={inspirationCols}
              />
            </Grid>
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
  history: PropTypes.object.isRequired,
  logo: PropTypes.object,
  match: PropTypes.object.isRequired
}

const PreviewContentContainer = memo(PreviewContent)

export default memo(PreviewPage)
