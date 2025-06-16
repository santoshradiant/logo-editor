import { styled } from '@mui/material/styles'
import { css } from '@emotion/react'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'

export const TextWrapper = styled('div')`
  padding: ${(props) => props.theme.spacing(4, 0)};
`

export const MultilineSwitchWrapper = styled('div')`
  margin-top: ${(props) => props.theme.spacing(-2)};
`

export const MerchButton = styled(IconButton)`
  width: 50%;
  height: 30%;
  ${(props) =>
    props.active &&
    css`
      pointer-events: none;
    `}
`

export const MerchImage = styled(Avatar)`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  box-shadow:
    0 2px 4px 0 rgba(0, 0, 0, 0.2),
    0 3px 10px 0 rgba(0, 0, 0, 0.19);
  ${(props) =>
    props.active &&
    css`
      border: 4px solid;
      border-color: ${props.theme.palette.primary.light};
      pointer-events: none;
    `}
`
