import { styled } from '@mui/material/styles'
import OnboardingLayout from '../onboarding/onboarding.views'

const Layout = styled('div')`
  height: 100%;
  display: flex;
  align-items: stretch;
  background: #e9eaeb;
  flex-direction: column;
`

Layout.LogoContainer = styled('div')(
  ({ theme }) => `
  overflow: auto;
  flex-grow: 2;
  margin-bottom: ${theme.spacing(20)}px;
  display: block;
  padding: ${theme.spacing(0, 20, 0, 20)}px;

  ${theme.breakpoints.down('sm')} {
    padding: ${theme.spacing(0, 6.25)}px;
  }
`
)

Layout.Button = OnboardingLayout.Button

Layout.HeaderWrapper = styled('div')(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(1)}px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
`
)

Layout.TitleContainer = styled('div')`
  display: flex;
  flex-grow: 2;
  flex-direction: column;
  justify-content: center;
`

Layout.TitleBar = styled('div')(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing(1)}px;
  background: red;

  h3 {
    align-self: center;
    ${theme.breakpoints.down('sm')} {
      font-size: ${theme.spacing(3.75)}px;
    }
  }

  button {
    ${theme.breakpoints.down('sm')} {
      font-size: ${theme.spacing(3.25)}px;
    }
  }
`
)

Layout.Footer = styled('div')(
  ({ theme, width = 0 }) => `
  margin-bottom: ${theme.spacing(1)}px;
  display: flex;
  background: #e9eaeb;
  justify-items: flex-end;
  min-height: ${theme.spacing(20)}px;
  width: ${width - 174}px;
  position: absolute;
  z-index: 10;
  bottom: 0;
  opacity: ${width ? 1 : 0};
  visibility: ${width ? 'visible' : 'hidden'};
  transition: width 0.5s ease, height 0.5s ease, opacity 0.5s ease-in, visibility 0.5s ease-in;

  ${theme.breakpoints.down(770)} {
    width: 100%;
    height: 10%;
    position: fixed;
    margin-bottom: 0px;

    .sc-fznKkj {
      width: 48%;
    }
  }
`
)

export default Layout
