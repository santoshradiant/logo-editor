import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'

import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

import fontCategories from 'logomaker/config/font-categories'
import LogoMakerContext from 'logomaker/context/editor-context'

import get from 'lodash/get'
import set from 'lodash/set'

import FontResources from 'core/logo-maker/resources/font-resources'

const FontCategoryTab = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  min-height: 46px;
  padding: ${(props) => props.theme.spacing(1)};
  border: 1px solid ${(props) => (props.selected ? props.theme.palette.primary.main : 'rgba(0, 0, 0, 0.24)')};
  transition: all 0.25s ease-in;

  &:hover {
    cursor: pointer;
    border-color: ${(props) => props.theme.palette.primary.main};
  }

  svg {
    width: 80%;
    fill: ${(props) => (props.selected ? props.theme.palette.primary.main : 'inherit')};
    overflow: initial;
  }
`

const FontControl = (props) => {
  const FontResource = FontResources.getInstance()
  const logoMakerContext = useContext(LogoMakerContext)

  const selected = get(logoMakerContext.editorTemplate, 'font.brand1.category') || 'decorative'

  const setValue = (fontName) => {
    const selectVal = FontResource.getFontForId(fontName)
    const { brand1, brand2 } = FontResource.getRandomFontPair(selectVal)
    set(logoMakerContext.editorTemplate, 'font.brand1.id', brand1.id)
    set(logoMakerContext.editorTemplate, 'font.brand1.category', fontName)
    set(logoMakerContext.editorTemplate, 'font.brand2.id', brand2.id)
    logoMakerContext.setTemplateActive(logoMakerContext.editorTemplate)
  }

  return (
    <Grid container className='py-3'>
      <Grid container>
        <Grid  size={6}>
          <Typography gutterBottom variant='body1'>
            {props.label}
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid  size={12}>
          <Grid container spacing={1}>
            {fontCategories.map((font) => (
              <Grid key={font.name}  size={{ xs: 6, sm: 6 }}>
                <FontCategoryTab
                  onClick={() => setValue(font.name)}
                  selected={selected.toLowerCase() === font.name.toLowerCase()}
                >
                  <font.font />
                </FontCategoryTab>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

FontControl.propTypes = {
  label: PropTypes.string.isRequired
}

export default FontControl
