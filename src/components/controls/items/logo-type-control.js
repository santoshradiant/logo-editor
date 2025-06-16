/* eslint-disable no-use-before-define */
import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'

import Select from '@eig-builder/control-select'
import get from 'lodash/get'
import LogoMakerContext from 'logomaker/context/editor-context'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

const SelectLogoType = (props) => {
  const getSymbol = () => get(logoMakerContext.editorTemplate, 'symbol.icon')
  const logoMakerContext = useContext(LogoMakerContext)
  const [selected, setSelected] = useState('symbol')
  const [previousSymbol, setPreviousSymbol] = useState(getSymbol())
  const [previousInitials, setPreviousInitials] = useState(getSymbol())

  const getDefaultInitials = () => {
    let result = ''
    const brandName = get(logoMakerContext.editorTemplate, 'text.brandName')
    if (brandName) {
      const words = brandName.match(/\w\w*/g)
      for (const word of words) {
        if (word && word.length > 0) {
          result += word[0].toUpperCase()
        }
      }
    }
    return result
  }

  const setSymbol = (type) => {
    const _previousSymbol = previousSymbol
    setPreviousSymbol(getSymbol())

    setSelected(type)
    if (selected === type) {
      setPreviousSymbol(getSymbol())
      logoMakerContext.updateValueInTemplate('symbol.icon', _previousSymbol)
      logoMakerContext.updateValueInTemplate('layout.symbol.position', 'top')
    } else {
      const val =
        previousInitials.type === 'initials'
          ? previousInitials
          : {
              type: 'initials',
              initials: getDefaultInitials()
            }
      setPreviousInitials(val)
      logoMakerContext.updateValueInTemplate('symbol.icon', val)
      logoMakerContext.updateValueInTemplate('layout.symbol.position', 'top')
    }
  }

  return (
    <Grid container sx={{ justifyContent: 'space-between' }}>
      <Grid  size={6}>
        <Typography style={{ marginTop: '14px' }} variant='body1'>
          {props.label}
        </Typography>
      </Grid>
      <Grid  size={6}>
        <Select variant='outlined' name='select-input' options={props.options} value={selected} onChange={setSymbol} />
      </Grid>
    </Grid>
  )
}

SelectLogoType.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })
  ).isRequired
}

export default SelectLogoType
