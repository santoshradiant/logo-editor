import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import FormControlLabel from '@mui/material/FormControlLabel'
import OnboardingLayout from '../../../onboarding/onboarding.views'
import { Button } from '@mui/material'

const Layout = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  color: ${({ theme }) => theme.palette.black.mainText};
`

Layout.BrandDetailsContainer = styled(Grid)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  padding-top: ${({ theme }) => theme.spacing(14)};

  @media (max-width: 992px) {
    margin-bottom: 0px;
    padding-top: ${({ theme }) => theme.spacing(2)};
  }
`

Layout.Button = styled(Button)`
  color: ${({ theme, textColor }) => (textColor ? theme.palette.black.mainText : theme.palette.white.mainText)};
  & span {
    text-decoration: underline;
  }
`

Layout.Grid = styled(Grid)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  padding: 0px ${({ theme }) => theme.spacing(2)};

  h5 {
    font-size: ${({ theme }) => theme.spacing(4)};
    font-weight: ${({ theme }) => theme.spacing(125)};
  }

  .app-logo-mfe-MuiTypography-body1 {
    font-weight: ${({ theme }) => theme.spacing(75)};
  }
`

Layout.Field = OnboardingLayout.Field

Layout.StyledFormControlLabel = styled(FormControlLabel)(({ theme, alignContent, height = 'auto' }) => ({
  width: '100%',
  height,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: alignContent ?? 'start',
  '.Mui-disabled': { color: theme.palette.black.mainText },
  margin: `0px 0px ${theme.spacing(5)} 0px`,
  marginBottom: theme.spacing(3)
}))
Layout.SwitchContainer = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(1.75)};
`
Layout.ToggleContainer = styled('div')`
  width: 100%;

  h5 {
    font-weight: ${({ theme }) => theme.typography.fontWeightLight};
  }
`

export default Layout
