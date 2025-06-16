import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import LogoMakerContext from 'logomaker/context/editor-context'
import get from 'lodash/get'
import Select from '@mui/material/Select'
import OutlinedInput from '@mui/material/OutlinedInput'

import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import FontResources from 'core/logo-maker/resources/font-resources'
import FontIframe from './font-iframe'

const FontCategoryTab = styled('div')`
  max-width: 120px !important;
  overflow: hidden;
  text-overflow: ellipsis;
`
const FontCategoryTab2 = styled('div')`
  display: block;
  width: 160px;
  height: 40px;
  line-height: 49px;
`

const FontSelectorControl = (props) => {
  const FontResource = FontResources.getInstance()
  const logoMakerContext = useContext(LogoMakerContext)
  const selectedFont = get(logoMakerContext.editorTemplate, `font.${props.target}.id`)
  let fontCategory = get(logoMakerContext.editorTemplate, `font.${props.target}.category`)
  if (!fontCategory) {
    fontCategory = FontResource.getCategoryForFont(selectedFont)
  }
  const availableOptions = FontResource.getFontsByCategory(fontCategory)
  if (!selectedFont) {
    console.error('No font specified!')
    return null
  }

  // Render of the current value
  const renderValue = (fontId) => {
    const fontObj = FontResource.getFontForId(fontId)
    return <FontCategoryTab>{fontObj.name}</FontCategoryTab>
  }

  // Set the new value
  const setValue = (e) => logoMakerContext.updateValueInTemplate(`font.${props.target}.id`, e.target.value)

  return (
    <Grid container sx={{ justifyContent: 'space-between' }} className='py-1'>
      <Grid size={6}>
        <Typography style={{ marginTop: '14px' }}>{props.label}</Typography>
      </Grid>
      <Grid size={6}>
        <Select
          variant='outlined'
          name='select-input'
          input={<OutlinedInput name='age' id='outlined-age-simple' />}
          renderValue={renderValue}
          value={selectedFont}
          onChange={setValue}
        >
          {availableOptions.map((font) => {
            return (
              <MenuItem key={font.id} value={font.id}>
                <FontCategoryTab2>
                  <FontIframe fontObj={font} />
                </FontCategoryTab2>
              </MenuItem>
            )
          })}
        </Select>
      </Grid>
    </Grid>
  )
}

FontSelectorControl.propTypes = {
  target: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
}

export default FontSelectorControl
