import { CircularProgress, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'

const Layout = styled(Paper)(({ theme }) => ({
  height: '85%',
  minHeight: theme.spacing(178),
  padding: theme.spacing(8)
}))

Layout.Container = styled('div')(({ height = '100%', flexDirection = 'row', flexWrap = 'nowrap' }) => ({
  display: 'flex',
  flexWrap: flexWrap,
  flexDirection: flexDirection,
  width: '100%',
  height: height
}))

Layout.Logo = styled('div')`
  width: 100%;
  height: 100%;
  overflow: hidden;
  .svg-hover-area {
    display: none !important;
  }
`
Layout.LoadingIcon = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.black.light,
  marginRight: theme.spacing(2),
  [theme.breakpoints.down(350)]: {
    display: 'none'
  }
}))

Layout.TitleContainer = styled('div')(
  ({ height = 'auto', flexDirection = 'row', flexWrap = 'nowrap', justifyContent = 'space-between' }) => ({
    display: 'flex',
    flexWrap: flexWrap,
    flexDirection: flexDirection,
    justifyContent: justifyContent,
    width: '100%',
    height: height
  })
)

Layout.Item = styled('div')(({ width = '100%', height = '100%', top = 8, right = 8, bottom = 8, left = 0, theme }) => ({
  height: height,
  width: width,
  padding: theme.spacing(top, right, bottom, left)
}))

export default Layout
