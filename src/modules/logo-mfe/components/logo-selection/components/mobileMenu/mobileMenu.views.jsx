import { styled } from '@mui/material/styles'
import { Button } from '@mui/material'

const Layout = styled('div')`
  color: ${({ theme }) => theme.palette.black.mainText};

  & > :first-child {
    font-size: ${({ theme }) => theme.spacing(3.75)};
    font-weight: ${({ theme }) => theme.spacing(125)};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }
`
Layout.InfoContainer = styled('div')`
  background-color: #353738;
  border-radius: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => `${theme.spacing(3.5)} ${theme.spacing(4.5)} ${theme.spacing(3.5)} ${theme.spacing(4.75)}`};

  h5 {
    font-size: ${({ theme }) => theme.spacing(3.5)};
    font-weight: ${({ theme }) => theme.spacing(25)};
    margin-bottom: 1px;

    @media (max-width: 700px) {
      font-size: ${({ theme }) => theme.spacing(3.25)};
    }
  }

  & > :nth-child(2) {
    font-weight: ${({ theme }) => theme.spacing(150)};
  }
`
Layout.SwitchContainer = styled('div')`
  display: flex;

  & > :nth-child(odd) {
    margin-right: ${({ theme }) => theme.spacing(1.25)};
  }

  & > :nth-child(even) {
    font-weight: ${({ theme }) => theme.spacing(150)};
    margin-right: ${({ theme }) => theme.spacing(3.75)};
  }
`
Layout.Button = styled(Button)`
  color: ${({ theme }) => theme.palette.black.mainText};
  position: absolute;
  right: ${({ theme }) => theme.spacing(12.5)};
  top: ${({ theme }) => theme.spacing(15)};
  text-decoration: underline;
  font-size: ${({ theme }) => theme.spacing(3.25)};
  font-weight: ${({ theme }) => theme.spacing(100)};
`

export default Layout
