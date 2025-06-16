import React from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'

import Placeholder from '../../core/logo-maker/images/placeholder/placeholder-element'

const StyledImage = styled('img')`
  max-height: 90%;
  max-width: 90%;
  margin: auto;
  animation: fadein 1s;
  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const LogosSliderLogo = ({ image, placeholder }) => {
  return placeholder ? (
    <Placeholder />
  ) : (
    <StyledImage alt='logo-preview' className='my-logo-preview' src={image.baseImage || image.url} />
  )
}
LogosSliderLogo.propTypes = {
  image: PropTypes.object,
  placeholder: PropTypes.bool
}

export default LogosSliderLogo
