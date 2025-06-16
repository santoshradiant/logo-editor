import React, { useContext, memo, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import LogoMakerContext from 'logomaker/context/editor-context'
import TextField from '@mui/material/TextField'
import get from 'lodash/get'
import set from 'lodash/set'
import debounce from 'lodash/debounce'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

const updateDebounce = debounce((logoMakerContext, templatekey, val) => {
  logoMakerContext.updateValueInTemplate(templatekey, val)
}, 750)

const TextfieldWithMaxLength = styled(TextField)`
  p {
    text-align: right;
  }
`
const TextfieldContainer = styled('div')`
  padding-right: ${({ theme }) => theme.spacing(1)};
`

const TextControl = props => {
  const logoMakerContext = useContext(LogoMakerContext)
  const logoInstance = logoMakerContext.logoInstance || {}
  const [value, setValue] = useState(get(logoInstance.templateData, props.templateKey))

  const templatevalue = get(logoInstance.templateData, props.templateKey)

  useEffect(() => {
    if (logoInstance) {
      setValue(templatevalue)
    }
  }, [logoInstance, props.templateKey, templatevalue])

  const update = (templateKey, value) => {
    if (props.max && value.length > props.max.value) {
      return
    }

    // logoMakerContext.updateValueInTemplate(templateKey, value)

    // this breaks all the update check in the logoinstance
    // set(logoInstance.templateData, props.templateKey, value)
    // logoInstance.updateLayout()
    // Use this instead
    logoInstance.update(set({}, props.templateKey, value))

    setValue(value)
    updateDebounce.cancel()
    updateDebounce(logoMakerContext, props.templateKey, value)
  }

  const getHelperText = () => {
    if (value && props.max && value.length >= props.max.helperText) {
      return `${value.length}/${props.max.value}`
    }
  }

  const TextComponent = props.max ? TextfieldWithMaxLength : TextField
  // const logoName = get(logoMakerContext.editorTemplate, props.templateKey)
  return (
    <TextfieldContainer>
      <TextComponent
        onChange={e => update(props.templateKey, e.target.value)}
        variant='outlined'
        disabled={props.locked}
        dataElementLocation={DataElementLocations.LEFT_RAIL}
        dataElementId={props.templateKey}
        dataElementLabel='logo-text-control'
        InputLabelProps={{ shrink: !!(value && value !== '') }}
        helperText={getHelperText()}
        fullWidth
        label={props.label}
        value={value || ''}
      />
    </TextfieldContainer>
  )
}

TextControl.propTypes = {
  templateKey: PropTypes.string.isRequired,
  label: PropTypes.object.isRequired,
  max: PropTypes.object,
  locked: PropTypes.bool
}

export default memo(TextControl)
