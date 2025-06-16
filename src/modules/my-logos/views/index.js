import { styled } from '@mui/material/styles'
import { css } from '@emotion/react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import { Box } from '@mui/material'

const ButtonStyle = css`
  margin-right: 8px;
  margin-bottom: 8px;
`
export const HeaderGrid = styled(Grid)`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding-left: ${({ theme, isMobile }) => (theme.spacing(isMobile? 3 : 11) )};
  padding-right: ${({ theme, isMobile }) => (theme.spacing(isMobile? 3 : 5))};
  padding-bottom: ${({ isMobile }) => (!isMobile ? '16' : '0')};
`;

export const GridContainer = styled(Box)`
  position: relative;
  ${({ theme }) => `
    margin-top: ${theme.spacing(8)};
  `}
`
export const HeaderContainer = styled('div')`
  padding-top: ${({ theme }) => theme.spacing(8)};
`
export const HeaderTitle = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  color: black;
  z-index: 5;
  color: ${({ theme }) => theme.palette.grey.A700};
`
HeaderTitle.defaultProps = {
  variant: 'h1',
};
export const HeaderSubtitle = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  z-index: 5;
  word-break: normal;
  white-space: normal;
  color: ${({ theme }) => theme.palette.grey.A700};
`
HeaderSubtitle.defaultProps = {
  variant: 'subtitle1',
};
export const TitleSection = styled('div')`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-grow: 1;
  z-index: 1;
  max-width: 100%;
  min-height: 50px;
`
export const CreateButton = styled(Button)`
  flex-shrink: 0;
  top: 12px;
  float: right;
  ${ButtonStyle}
  ${({ theme }) => `
    border-color: ${theme.palette.primary.main};;
  `};

  text-transform: uppercase;
`
CreateButton.defaultProps = {
  variant: 'contained',
};