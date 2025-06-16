import { styled } from '@mui/material/styles'
import Breakpoints from '@eig-builder/core-utils/hooks/useResponsiveQuery'

const PreviewLogoContent = styled('div')`
  width: 40%;
  max-width: 400px;
  margin: auto;
  transition: all 1s;

  @media screen and (max-width: ${Breakpoints.MOBILE}px) {
    margin-top: 56px;
  }

  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    margin-top: 56px;
    width: 70%;
  }
  @media only screen and (orientation: landscape) and (max-height: 450px) and (max-width: 900px) {
    width: 53%;
    margin: 0 auto;

    .logo-editor-preview {
      padding-top: 14px;
    }
  }
  @media screen and (min-height: 760px) {
    &.closeupMode {
      /* margin-top: 20vh; */
      /* margin-bottom: 50vh; */
      width: 100%;
    }
  }
`

export default PreviewLogoContent
