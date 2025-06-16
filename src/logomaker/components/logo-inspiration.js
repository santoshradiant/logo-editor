import React, { memo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ImageComposer from './image-composer'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import getWebGLContext from 'core/logo-maker/previewmaker/webglutils'
import Breakpoints from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { DataElementLocations, DataElementTypes, getDataProperty } from '@eig-builder/core-utils/helpers/tagging-helper'
import { styled } from '@mui/material/styles'

// Estilos usando template literals
const Container = styled('div')`
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.08);
  background: white;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
`

const StyledCard = styled(Card)`
  background-image: ${({ image }) =>
    image
      ? `url(${image}), linear-gradient(0deg, #EFF4F4 0%, #EFF4F4 100%)`
      : `linear-gradient(0deg, #EFF4F4 0%, #EFF4F4 100%)`} !important;
  background-position: ${({ 'data-centered': centered }) => (centered ? 'bottom' : 'top')} !important;
  background-size: ${({ additionalstyles = {} }) => `${additionalstyles['background-size'] || 'cover'} !important`};
  position: relative;
  padding-top: 63%;
  min-height: 0 !important;
  min-width: inherit !important;
  box-shadow: none !important;
  border-radius: 4px 4px 0 0 !important;
`

const StyledLogo = styled('div')`
  position: absolute;
  top: ${({ top }) => `calc(${top}% + 20px)`};
  left: ${({ left }) => `${left}%`};
  width: ${({ width }) => `${width}%`};
  height: ${({ height }) => `${height}%`};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
  background-image: ${({ img }) => `url(${img})`};
  ${({ additionalStyling }) => additionalStyling};
`

const LogoComposition = styled(ImageComposer)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  cursor: pointer;
  ${({ additionalStyling }) => additionalStyling};
`

const StyledGrid = styled(Grid)`
  width: 100% !important;
  margin: 0 auto !important;
  margin-bottom: ${({ theme }) => theme.spacing(4)} !important;

  @media (max-width: ${Breakpoints.TABLET}) {
    padding-left: ${({ theme }) => theme.spacing(4)};
  }
`

const LogoInspiration = ({ logo, inspirations, cols, logoInstance }) => {
  const [webGLEnabled] = useState(getWebGLContext(document.createElement('canvas')))
  const [foregroundImage, setForegroundImage] = useState()
  const [dimensions, setDimensions] = useState()

  logoInstance.updateLayout()

  const image = {
    baseImage: logo.preview_image_data,
    url: logo.preview_image_url,
    svg: logo.svg
  }
  const useSvg = !image.url && !image.baseImage

  useEffect(() => {
    const interval = setInterval(() => {
      if (logoInstance.checkAllResourcesLoaded()) {
        logoInstance.rerender((width, height) => {
          setForegroundImage(`data:image/svg+xml,${window.escape(logoInstance.getSVG())}`)
          setDimensions(logoInstance.getDimensions())
        })
        clearInterval(interval)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [logoInstance])

  return (
    <StyledGrid container spacing={4}>
      {inspirations.map((inspiration) => (
        <Grid key={inspiration.name}  size={{ xs: cols }}>
          <Container>
            <StyledCard
              image={inspiration.render && webGLEnabled ? undefined : inspiration.image}
              additionalstyles={inspiration.backgroundStyling}
              data-centered={inspiration.centered}
            >
              {inspiration.render && webGLEnabled ? (
                <LogoComposition
                  src={inspiration.image}
                  srcSettings={inspiration.background}
                  foreGroundImage={foregroundImage}
                  settings={inspiration.render}
                  animate={inspiration.animate}
                  dimensions={dimensions}
                />
              ) : useSvg ? (
                <StyledLogo dangerouslySetInnerHTML={{ __html: image.svg }} {...inspiration} />
              ) : (
                <StyledLogo img={image.url || image.baseImage || image.svg} {...inspiration} />
              )}
            </StyledCard>
            <CardContent>
              <Typography variant='h3'>{inspiration.label}</Typography>
            </CardContent>
          </Container>
        </Grid>
      ))}
    </StyledGrid>
  )
}

LogoInspiration.propTypes = {
  cols: PropTypes.number,
  inspirations: PropTypes.array.isRequired,
  logoInstance: PropTypes.object,
  logo: PropTypes.object.isRequired
}

export const LogoInspirationWithoutRouter = memo(LogoInspiration)
export default memo(LogoInspiration)
