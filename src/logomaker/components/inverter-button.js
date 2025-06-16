import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useEditorContext } from '../context/editor-context'
import InverterIcon from '../images/background-inverter.svg'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'

const StyledIcon = styled('img')`
  height: 24px;
  width: 24px;
`

const InverterButton = props => {
  const { logoInstance } = useEditorContext()
  const { inverted, setInversion } = props

  return (
    <IconButton>
      <StyledIcon
        src={InverterIcon}
        onClick={() => {
          const newValue = !inverted
          logoInstance.updateBackground(newValue)
          setInversion(newValue)
        }}
      />
    </IconButton>
  )
}

InverterButton.propTypes = {
  inverted: PropTypes.bool,
  setInversion: PropTypes.func.isRequired
}

export default memo(InverterButton)
