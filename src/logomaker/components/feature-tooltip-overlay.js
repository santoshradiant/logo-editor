import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import { css } from '@emotion/react'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

const Overlay = styled('div')`
  position: absolute;
  top: ${({ topOffset }) => topOffset ?? 0}px;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.palette.lightGray.main};
  padding: ${({ theme }) => theme.spacing(4)};
  z-index: 11;

  transform: translateX(100%);
  transition: transform 250ms ease-in-out;
  ${({ open }) =>
    open &&
    css`
      transform: translateX(0);
    `}
`

const FeatureTooltipOverlay = ({ tooltip, onClose }) => {
  const isMobile = useIsMobile()
  const ref = useRef()

  return (
    <Overlay ref={ref} open={tooltip != null} topOffset={ref.current?.parentElement?.scrollTop}>
      {tooltip != null && React.createElement(tooltip, { onClose, isMobile })}
    </Overlay>
  )
}

FeatureTooltipOverlay.propTypes = {
  tooltip: PropTypes.element,
  onClose: PropTypes.func.isRequired
}

export default FeatureTooltipOverlay
