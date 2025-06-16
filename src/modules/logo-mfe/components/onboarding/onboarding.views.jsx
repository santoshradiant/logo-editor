import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'

const Layout = styled('div')``

Layout.ToolbarContainer = styled(Container)`
  padding: 0;
`

Layout.TitleContainer = styled(Grid)`
  padding: ${({ theme }) => `${theme.spacing(7)} ${theme.spacing(7)}`};
`

Layout.Button = styled(Button)`
  color: ${({ theme }) => theme.palette.common.white};
`

Layout.Field = styled(TextField)`
  background: ${({ theme, disabled }) => (disabled ? '#353738' : theme.palette.common.white)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  margin-bottom: ${({ theme, multiline }) => theme.spacing(multiline ? 6 : 3)}px;

  .MuiOutlinedInput-root {
    & .MuiOutlinedInput-notchedOutline {
      border: none;
    }
  }
  .Mui-focused {
    border: none;
  }
  .MuiOutlinedInput-input {
    padding: ${({ theme }) => theme.spacing(3)};
  }
`

Layout.Field.defaultProps = {
  autoComplete: 'off'
}

export default Layout
