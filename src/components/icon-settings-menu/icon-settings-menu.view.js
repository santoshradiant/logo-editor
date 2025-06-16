import { styled } from '@mui/material/styles'
import { css } from '@emotion/react'
import Grid from '@mui/material/Grid2'
import BreakPoints from '@eig-builder/core-utils/hooks/useResponsiveQuery'

export const StyledGrid = styled(Grid)({
  height: '100%',
  backgroundColor: 'transparant'
})

export const Label = styled('span')`
  font-size: 16px;

  @media screen and (max-width: 1024px) {
    font-size: 13px;
  }
`

export const IconContainer = styled('div')`
  position: relative;
  height: 80px;
  width: 100%;
  min-width: 100%;

  display: block;
  ${({ isMobile }) =>
    isMobile
      ? css`
          display: flex;
          height: 100%;
          width: max-content;
          justify-content: center;
          flex-wrap: nowrap;
        `
      : ''};
`

export const IconBarButton = styled('button')`
  border: none;
  -webkit-appearance: button;
  background: transparent;
  padding: 0;
  margin: 0;

  text-align: center;
  overflow: hidden;
  height: 80px;
  width: 100%;
  float: left;

  font-size: ${(props) => (props.smallFontSize ? '13px' : 'initial')};

  z-index: 2;
  position: relative;

  ${(props) =>
    props.active &&
    css`
      border: 1px solid lightgray;
      background: ${props.theme.palette.white.main};
      border-right: 1px solid white;
      border-left: 0;
      border-top: ${props.index === 0 ? 0 : 1}px solid lightgray;
    `}

  :hover {
    cursor: ${(props) => (!props.active ? 'pointer' : 'initial')};
    background: ${({ theme }) => theme.palette.white.main};
  }

  svg {
    fill: #676767;
  }
  ${({ isMobile, active }) =>
    isMobile
      ? css`
          width: 80px;
          height: 80px;
          border-bottom: none;
          border-right: ${active ? 1 : 0}px solid lightgray;
          border-left: ${active ? 1 : 0}px solid lightgray;
          box-sizing: border-box;
        `
      : ''};
`

export const FullHeightWrapper = styled('div')`
  height: 100%;
  width: ${({ isMobile }) => (isMobile ? '100%' : '90px')};
  border-right: 1px solid lightgray;
  user-select: none;
  float: left;
  box-sizing: content-box;
  background-color: #f6f6f6;
  overflow-x: ${({ isMobile }) => (isMobile ? 'auto' : 'hidden')};
`
