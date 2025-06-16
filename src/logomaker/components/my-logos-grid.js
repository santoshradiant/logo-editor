import React, { memo } from 'react'
import PropTypes from 'prop-types'

import Grid from '@mui/material/Grid2'

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import LogoTile from '../../components/logo-tile'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import OnboardingLink from 'modules/onboarding-link'
import LogoTileContainer from '../../components/logo-tile/logo-tile-container'
import { useNavigate } from 'react-router'

const MyLogosGrid = ({ selectLogo, deleteLogo, previewLogo, downloadLogo, logos }) => {
  const navigate = useNavigate()

  const goEditLogo = (id) => {
    window.navigationState.drawer.next(false)
    window.navigationState.header.next(false)
    goToWithHistory(navigate, `/editor/${id}/name`)
  }

  const isMobile = useIsMobile()
  const sortedLogosOnModified = logos.sort((a, b) => new Date(b.modified_on) - new Date(a.modified_on))

  return (
    <Grid
      container
      spacing={isMobile ? 1 : 4}
      sx={{
        mx: { xs: 2, md: 4 },
        pr: { md: 2 },
        pt: { md: 4 }
      }}
    >
      {sortedLogosOnModified.map((logo) => (
        <Grid  size={{ xs: 12, sm: 12, md: 3 }}>
          <LogoTile
            key={logo.id}
            logo={logo}
            makeLogoSelected={selectLogo}
            deleteLogo={deleteLogo}
            goEditLogo={goEditLogo}
            goPreviewLogo={previewLogo}
          />
        </Grid>
      ))}
      {sortedLogosOnModified.length === 0 && (
        <LogoTileContainer>
          <OnboardingLink />
        </LogoTileContainer>
      )}
    </Grid>
  )
}

MyLogosGrid.propTypes = {
  selectLogo: PropTypes.func.isRequired,
  deleteLogo: PropTypes.func.isRequired,
  previewLogo: PropTypes.func.isRequired,
  downloadLogo: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  logos: PropTypes.array.isRequired
}

export default memo(MyLogosGrid)
