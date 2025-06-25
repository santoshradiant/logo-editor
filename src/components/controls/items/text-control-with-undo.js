import React, { useContext, memo, useState, useEffect, useRef, useCallback } from 'react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import LogoMakerContext from 'logomaker/context/editor-context'
import TextField from '@mui/material/TextField'
import get from 'lodash/get'
import set from 'lodash/set'
import debounce from 'lodash/debounce'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

// Create a debounced function that will trigger the main undo/redo system
const createUpdateDebounce = (logoMakerContext, templatekey) => 
  debounce((val) => {
    logoMakerContext.updateValueInTemplate(templatekey, val)
  }, 1000) // 1 second debounce for creating undo checkpoints

const TextfieldWithMaxLength = styled(TextField)`
  p {
    text-align: right;
  }
`
const TextfieldContainer = styled('div')`
  padding-right: ${({ theme }) => theme.spacing(1)};
`

const TextControlWithUndo = props => {
  const logoMakerContext = useContext(LogoMakerContext)
  const logoInstance = logoMakerContext.logoInstance || {}
  const templatevalue = get(logoInstance.templateData, props.templateKey)
  
  const [value, setValue] = useState(templatevalue || '')
  const inputRef = useRef(null)
  const updateDebounceRef = useRef(null)
  const lastCommittedValue = useRef(templatevalue || '')

  // Create debounced update function
  useEffect(() => {
    if (logoMakerContext && props.templateKey) {
      updateDebounceRef.current = createUpdateDebounce(logoMakerContext, props.templateKey)
    }
  }, [logoMakerContext, props.templateKey])

  // Update local value when template changes externally (like from undo/redo)
  useEffect(() => {
    if (logoInstance && templatevalue !== value) {
      setValue(templatevalue || '')
      lastCommittedValue.current = templatevalue || ''
      // Cancel any pending debounced update when external change occurs
      if (updateDebounceRef.current) {
        updateDebounceRef.current.cancel()
      }
    }
  }, [logoInstance, props.templateKey, templatevalue])

  const update = useCallback((templateKey, newValue) => {
    if (props.max && newValue.length > props.max.value) {
      return
    }

    // Update logo instance immediately for real-time preview
    logoInstance.update(set({}, props.templateKey, newValue))
    setValue(newValue)
    
    // Trigger debounced update to main undo/redo system
    if (updateDebounceRef.current) {
      updateDebounceRef.current(newValue)
    }
  }, [logoInstance, props.templateKey, props.max])

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      if (updateDebounceRef.current) {
        updateDebounceRef.current.cancel()
      }
    }
  }, [])

  const getHelperText = () => {
    if (value && props.max && value.length >= props.max.helperText) {
      return `${value.length}/${props.max.value}`
    }
  }

  const TextComponent = props.max ? TextfieldWithMaxLength : TextField

  return (
    <TextfieldContainer>
      <TextComponent
        ref={inputRef}
        onChange={e => update(props.templateKey, e.target.value)}
        variant='outlined'
        disabled={props.locked}
        dataElementLocation={DataElementLocations.LEFT_RAIL}
        dataElementId={props.templateKey}
        dataElementLabel='logo-text-control-with-undo'
        InputLabelProps={{ shrink: !!(value && value !== '') }}
        helperText={getHelperText()}
        fullWidth
        label={props.label}
        value={value || ''}
        placeholder={props.placeholder}
      />
    </TextfieldContainer>
  )
}

TextControlWithUndo.propTypes = {
  templateKey: PropTypes.string.isRequired,
  label: PropTypes.object.isRequired,
  max: PropTypes.object,
  locked: PropTypes.bool,
  placeholder: PropTypes.string
}

export default memo(TextControlWithUndo) 