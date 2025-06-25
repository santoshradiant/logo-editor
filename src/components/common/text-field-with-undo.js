import React, { useState, useRef, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import TextField from '@mui/material/TextField'
import debounce from 'lodash/debounce'

const TextFieldWithUndo = ({ 
  value, 
  onChange, 
  onKeyDown: externalKeyDown,
  undoRedoDelay = 1000, // Default 1 second delay before creating undo checkpoint
  ...props 
}) => {
  const [localValue, setLocalValue] = useState(value || '')
  const debouncedOnChangeRef = useRef(null)
  const lastCommittedValue = useRef(value || '')
  
  // Create debounced onChange to enable undo/redo checkpoints
  useEffect(() => {
    if (onChange) {
      debouncedOnChangeRef.current = debounce((newValue) => {
        const syntheticEvent = {
          target: { value: newValue }
        }
        onChange(syntheticEvent)
        lastCommittedValue.current = newValue
      }, undoRedoDelay)
    }
  }, [onChange, undoRedoDelay])

  // Update local value when external value changes (like from undo/redo)
  useEffect(() => {
    if (value !== localValue && value !== lastCommittedValue.current) {
      setLocalValue(value || '')
      lastCommittedValue.current = value || ''
      // Cancel any pending debounced update when external change occurs
      if (debouncedOnChangeRef.current) {
        debouncedOnChangeRef.current.cancel()
      }
    }
  }, [value, localValue])

  const handleChange = useCallback((e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    
    // Call immediate onChange for real-time updates (but don't create undo checkpoint yet)
    if (onChange) {
      onChange(e)
    }
    
    // Trigger debounced onChange for undo/redo checkpoint
    if (debouncedOnChangeRef.current) {
      debouncedOnChangeRef.current(newValue)
    }
  }, [onChange])

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      if (debouncedOnChangeRef.current) {
        debouncedOnChangeRef.current.cancel()
      }
    }
  }, [])

  return (
    <TextField
      {...props}
      value={localValue}
      onChange={handleChange}
      onKeyDown={externalKeyDown}
    />
  )
}

TextFieldWithUndo.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  undoRedoDelay: PropTypes.number
}

export default TextFieldWithUndo 