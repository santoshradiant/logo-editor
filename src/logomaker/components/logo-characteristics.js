import React, { memo, useRef } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import Grid from '@mui/material/Grid2'
import Text from '@eig-builder/module-localization'
import '../lang'
import Breakpoints, { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import FontResources from 'core/logo-maker/resources/font-resources'

import { rgbToHex } from 'logomaker/helpers/color-helper'
import get from 'lodash/get'

// Función auxiliar para generar valores RGB
function rgb(values) {
  return `rgb(${values.join(', ')})`
}

// Estilos usando styled y template literals
const Container = styled(Grid)`
  background: white;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  padding: ${({ theme }) => theme.spacing(4)};
  margin-top: 0; // compensar el -8px que genera <Grid container />
`

const ColorsContainer = styled(Grid)`
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`

const TypographyStyled = styled(Typography)`
  display: inline-block;
  line-height: 36px;
`

const TypographyBig = styled(Typography)`
  line-height: 36px;
`

const ColorBlock = styled('div')`
  float: left;
  background: ${({ color }) => color};
  height: 34px;
  width: 34px;
  margin: 0 4px;
  @media only screen and (max-width: ${Breakpoints.TABLET}px) {
    margin-top: 8px;
  }
  border-radius: 4px;
  position: relative;
  border: 1px solid #31394380;
  transition: box-shadow 0.45s cubic-bezier(0.23, 1, 0.32, 1) 0ms;
`

// Función para obtener los colores activos del logo
const getActiveColorsFromLogo = (editorTemplate) => {
  const symbol = get(editorTemplate, 'layout.symbol')
  const decoration = get(editorTemplate, 'layout.decoration')
  const [brand1, brand2] = get(editorTemplate, 'text.brandName').split(' ')
  const slogan = get(editorTemplate, 'text.slogan')

  const usedOptions = []
  if (symbol.position.toLowerCase() !== 'none') usedOptions.push('symbol')
  if (decoration.style.toLowerCase() !== 'none') usedOptions.push('decoration')
  if (brand1) usedOptions.push('brand1')
  if (brand2) usedOptions.push('brand2')
  if (slogan !== '') usedOptions.push('slogan')

  const color = editorTemplate.color
  const colorIndexes = []
  usedOptions.forEach((item) => {
    Object.keys(color).filter((key) => {
      if (item === key) {
        colorIndexes.push(color[key])
      }
    })
  })

  return get(color, 'palette').filter((_, i) => colorIndexes.includes(i))
}

const LogoCharacteristics = ({ editorTemplate }) => {
  const FontResource = useRef(FontResources.getInstance()).current

  const brandNames = editorTemplate.text.brandName.split(' ')
  const brand1 = brandNames[0] && get(editorTemplate.font, 'brand1').id
  const brand2 = brandNames[1] && get(editorTemplate.font, 'brand2').id
  const slogan = editorTemplate.text.slogan && get(editorTemplate.font, 'slogan').id

  const fonts = [brand1, brand2, slogan].filter(Boolean).filter((value, index, self) => self.indexOf(value) === index)
  const fontDisplayNames = fonts.map((font) => {
    const fontName = FontResource.getFontForId(font).name
    return fontName.replace(/[\W_]/g, ' ')
  })

  const colors = getActiveColorsFromLogo(editorTemplate)
  const isMobile = useIsMobile()

  return (
    <Container container spacing={2}>
      <Grid  size={isMobile ? 12 : 6} direction='row'>
        <Typography variant='h5' gutterBottom>
          <Text message='logomaker.previewLogo.colors' />
        </Typography>
        <Grid container sx={{ alignItems: 'center' }}>
          {colors
            .filter((value, i) => colors.findIndex((color) => rgb(color) === rgb(value)) === i)
            .map((color, index) => (
              <ColorsContainer item size={isMobile ? 3 : 6} key={index}>
                <ColorBlock color={rgb(color)} />
                <TypographyStyled variant='body1'>
                  <Text message={rgbToHex(...color)} />
                </TypographyStyled>
              </ColorsContainer>
            ))}
        </Grid>
      </Grid>

      <Grid  size={12}>
        <Typography variant='h5' gutterBottom>
          <Text message='logomaker.previewLogo.fonts' />
        </Typography>
        {fontDisplayNames.map((font) => (
          <TypographyBig variant='body1' key={font}>
            <Text message={font} />
          </TypographyBig>
        ))}
      </Grid>
    </Container>
  )
}

LogoCharacteristics.propTypes = {
  editorTemplate: PropTypes.object.isRequired
}

export default memo(LogoCharacteristics)
