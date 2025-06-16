import React, { useEffect, useRef } from 'react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'

const Container = styled('div')`
  width: 180px;
  height: 120px;
`

const LogoPreview = ({ logoInstance, ...props }) => {
  const ref = useRef()

  useEffect(() => {
    ref.current.appendChild(logoInstance.getPreviewElement())
  }, [])

  return <Container ref={ref} {...props} />
}

LogoPreview.propTypes = {
  logoInstance: PropTypes.object.isRequired
}

export default LogoPreview
