import { styled } from '@mui/material/styles'
import React from 'react'
// import PropTypes from 'prop-types'
import ImageSource from './logo.svg'

const LogoWrapper = styled('div')`
  position: fixed;
  top: 10px;

  @media (max-width: 700px) {
    top: 0;
    width: 100%;
    text-align: center;
    background-color: white;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.12);
  }
`

const Image = styled('img')`
  height: 30px;
  margin: 10px;
`

const Logo = () => {
  return (
    <LogoWrapper>
      <Image src={ImageSource} />
    </LogoWrapper>
  )
}

export default Logo
