import React, { memo } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const StyledCheckCircle = styled(CheckCircleIcon)`
  color: ${({ theme, color }) => color || theme.palette.primary.main};
  background: ${({ theme, background }) => background || theme.palette.white.main};
  border-radius: 50%;

  top: ${props => props.theme.spacing(-4)};
  right: ${props => props.theme.spacing(-4)};
  position: absolute;
  z-index: 2;
`

const CheckBoxIcon = ({ size, background, color }) => {
  return <StyledCheckCircle size={size} background={background} color={color} />
}

CheckBoxIcon.defaultProps = {
  size: 30,
  background: '#FFFFFF',
  color: '#0082ED'
}

CheckBoxIcon.propTypes = {
  size: PropTypes.number,
  background: PropTypes.string,
  color: PropTypes.string
}

export default memo(CheckBoxIcon)
