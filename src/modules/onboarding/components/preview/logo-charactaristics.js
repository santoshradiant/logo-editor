import React, { memo, useRef } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import FontResources from 'core/logo-maker/resources/font-resources'
import Grid from '@mui/material/Grid2'

import Text from '@eig-builder/module-localization'
import '.././../containers/lang'

import get from 'lodash/get'

const BORDER = 'rgba(200,202,196)'

const ColorWrapper = styled('div')`
  position: relative;
  height: 34px;
  width: 100%;
`

const baseDiv = styled('div')`
  border-top-left-radius: ${props => (props.first ? '4px' : '0')};
  border-bottom-left-radius: ${props => (props.first ? '4px' : '0')};

  border-top-right-radius: ${props => (props.last ? '4px' : '0')};
  border-bottom-right-radius: ${props => (props.last ? '4px' : '0')};

  border-top: 1px solid ${BORDER};
  border-bottom: 1px solid ${BORDER};
  border-left: ${props => (props.first ? `1px solid ${BORDER}` : '0')};
  border-right: ${props => (props.last ? `1px solid ${BORDER}` : '0')};
`

const ColorGroup = styled('div')`
  height: 100%;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  position: inherit;
  display: flex;
  align-items: flex-end;

  /* boxshadow around the "whole" colorgroup */
  &:after {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px ${BORDER}, inset 0 1px 2px ${BORDER};
    pointer-events: none;
  }

  /* every colorblock */
  > div {
    height: 100%;
    display: inline-block;
  }
`

const ColorBlock = styled(baseDiv)`
  background: ${props => props.color};
  height: 34px;
  width: ${props => (props.totalItems ? `${100 / props.totalItems}%` : '0')};
  position: relative;
  cursor: pointer;
`

const LogoCharacteristics = ({ templateData }) => {
  const FontResource = useRef(FontResources.getInstance()).current

  const color = templateData.color
  const colors = get(templateData.color, 'palette').filter((_, i) =>
    [color.brand1, color.brand2, color.slogan, color.decoration, color.symbol].includes(i)
  )

  const brand1 = get(templateData.font, 'brand1').id
  const brand2 = get(templateData.font, 'brand2').id
  const slogan = get(templateData.font, 'slogan').id

  const fonts = [brand1, brand2, slogan]
    .filter(item => item) // remove empty/null/undefined values
    .filter((value, index, self) => self.indexOf(value) === index) // filter on unique

  const fontDisplayNames = []

  fonts.forEach(font => {
    const fontName = FontResource.getFontForId(font).name
    const friendlyName = fontName.replace(/[\W_]/g, ' ')
    fontDisplayNames.push(friendlyName)
  })

  return (
    <>
      <ColorWrapper>
        <ColorGroup>
          {colors.map((color, index) => {
            return (
              <ColorBlock
                first={index === 0}
                last={colors.length === index + 1}
                key={`color_${index}`}
                color={color}
                totalItems={colors.length}
              />
            )
          })}
        </ColorGroup>
      </ColorWrapper>
      <Grid container>
        <Grid  size={12}>
          <Typography variant='subtitle1' className='pt-2'>
            <Text message='modules.onboarding.steps.preview.chosenFonts' />
          </Typography>
          {fontDisplayNames.map(font => (
            <Typography variant='subtitle1' key={font}>
              <Text message={font} style={{ fontWeight: 'bold' }} />
            </Typography>
          ))}
        </Grid>
      </Grid>
    </>
  )
}

LogoCharacteristics.propTypes = {
  templateData: PropTypes.object
}

export default memo(LogoCharacteristics)
