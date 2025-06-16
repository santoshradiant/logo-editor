import PropTypes from 'prop-types'
import React, { memo } from 'react'
import { styled } from '@mui/material/styles'

import { useMediaQuery, useIsPortrait, useIsDesktopUp } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import Landscape from './landscape.png'

const Dialog = styled('div')`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000000;
  background-image: url(${Landscape});
  background-position-x: center;
  background-size: contain;
  overflow: hidden;
  background-repeat: no-repeat;
  background-color: white;
`

const Container = styled('div')`
  overflow: ${({ open }) => open && 'hidden'};
  height: ${({ open }) => open && '100vh'};
`

const LandscapeWarning = ({ children }) => {
  const portrait = useIsPortrait()
  const mobileBreakpoint = useMediaQuery({
    query: '(max-height: 450px) and (max-width: 900px) and (min-width: 500px)'
  })
  const desktop = useIsDesktopUp()

  const open = !portrait && !desktop && mobileBreakpoint && !window.location.pathname.includes('logo/editor')

  return (
    <Container open={open}>
      {' '}
      {open ? <Dialog /> : null}
      {children}
    </Container>
  )
}

LandscapeWarning.propTypes = {
  children: PropTypes.node.isRequired
}

export default memo(LandscapeWarning)
