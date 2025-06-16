import { styled } from '@mui/material/styles'
import LogoSelection from '../logo-selection/logo-selection.views'

const Layout = styled('div')`
  height: 100%'
  display: flex'
  background: #e9eaeb;
  flex-direction: column;
`

Layout.HeaderWrapper = LogoSelection.HeaderWrapper
Layout.TitleContainer = LogoSelection.TitleContainer
Layout.LogoContainer = LogoSelection.LogoContainer
Layout.Footer = LogoSelection.Footer
Layout.DownloadContainer = styled('div')`
  position: absolute;
  z-index: -1;
  top: -9999px;
  left: 0;
  background: white;
  width: 100%;
  height: 100%;
`
Layout.OverlayLoading = styled('div')`
  position: absolute;
  top: 0;
  z-index: 1800;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(255, 255, 255, 50%);
  display: flex;
  justify-content: center;
  align-items: center;
`
export default Layout
