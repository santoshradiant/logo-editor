import React, { memo } from 'react'
import { withRouter } from 'react-router'

import { styled } from '@mui/material/styles'
import { useOnboardingContext } from '../../context/onboarding-context'

import LogoCharacteristics from './logo-charactaristics'

const PreviewWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: auto;
  width: 300px;
`

export const LogoWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: auto;
  width: 300px;
  border: ${({ theme }) => `1px solid ${theme.palette.gray.main}`};
  padding: ${({ theme }) => `${theme.spacing(8)}`};
  margin: ${({ theme }) => `0px 0px ${theme.spacing(2)} 0px`};
`

export const PreviewCard = styled('div')`
  /* padding-top: 56%; */
  position: relative;
  width: 100%;
`

export const PreviewImg = styled('img')`
  width: 100%;
  outline: none;
`

const Preview = () => {
  const { previewImage, instance } = useOnboardingContext()

  return previewImage && instance.templateData ? (
    <PreviewWrapper>
      <LogoWrapper>
        <PreviewImg src={previewImage} alt='logo' />
      </LogoWrapper>
      <LogoCharacteristics templateData={instance.templateData} />
    </PreviewWrapper>
  ) : null
}

export default memo(withRouter(Preview))
