import Breakpoints from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import IconButtonMaterial from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import { css } from '@emotion/react'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import InteractableElement from '@eig-builder/control-interactable-element'

export const StyledInteractableElement = styled(InteractableElement)`
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12), 0px 4px 6px 0px rgba(0, 0, 0, 0.06) !important;
`

export const StyledCard = styled(Card)`
  display: flex;
  align-content: center;
  justify-content: center;
  align-items: center;
  overflow: visible !important;

  padding-top: 70%;
  width: 100%;

  /* override, maybe can remove */
  min-width: 40px !important;
  min-height: 40px !important;

  border: 0.52px solid #ffffff;
  box-sizing: border-box;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);

  &:hover {
    ${({ placeholder }) =>
    !placeholder &&
      css`
        cursor: pointer;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1) !important;
      `}
  }

  @media screen and (max-width: ${Breakpoints.MOBILE}px) {
    box-shadow: 0 -4px 4px 0 rgba(0, 0, 0, 0.08) !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    margin-bottom: 0;
  }
`

export const CenterGridItem = styled(Grid)`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const ActionCardHoverBox = styled('div')`
  display: none;
`

export const ActionCard = styled(Card)`
  height: auto;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.04);

  /* override */
  min-height: 1px !important;

  width: 100%;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  background: white;
  z-index: 100;
  position: absolute !important;
  border-radius: 0 0 3px 3px !important;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  bottom: 0;

  &:hover {
    cursor: pointer;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  @media screen and (max-width: ${Breakpoints.MOBILE}px) {
    &:focus {
      display: block;
      position: initial !important;
      height: 60px;
      min-width: 100% !important;
    }
  }
`

export const LogoTileContainer = styled('div')`
  position: relative;
  &:hover .options {
    ${({ placeholder }) => !placeholder && 'display: block;'}
    animation: fadein 100ms cubic-bezier(.55, .085, .68, .53);
    @keyframes fadein {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
  @media screen and (max-width: ${Breakpoints.MOBILE}px) {
    margin-bottom: 12px;
  }
`

export const ImageContainer = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
`

export const IconButton = styled(IconButtonMaterial)`
  margin-top: 8px !important ;

  @media screen and(max-width: ${Breakpoints.MOBILE}px) {
    margin-top: 2px !important;
    padding: 8px !important;
  }
`
