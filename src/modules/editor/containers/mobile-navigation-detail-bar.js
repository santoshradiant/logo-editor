import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Navigation } from '@eig-builder/module-navigation'
import { LogoMaker } from '../../../logomaker'

import LogoBackButton from '../../../logomaker/components/logo-back-button'
import SaveButtonContainer from '../save-button-container'
import Grid from '@mui/material/Grid2'

import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

// import DropDownMenu from '../../../logomaker/components/drop-down-menu'
// import { DropdownFooterButton } from '@eig-builder/compositions-dropdown-menu'

import ActionButton from '@eig-builder/compositions-action-button'
import { useEditorContext } from './../../../logomaker/context/editor-context'
import { goToWithHistory } from '@eig-builder/core-utils/helpers/go-to-helper'
import Breakpoints, { useMediaQuery } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import isNil from 'lodash/isNil'
import { getUrl, siteNames, getQueryParametersFromUrl } from '@eig-builder/core-utils/helpers/url-helper'
import { SingleSpaContext } from 'single-spa-react'

import { styled } from '@mui/material/styles'

import './../../../logomaker/lang'
import { useNavigate } from 'react-router'

const StyledActionButton = styled(ActionButton)`
  margin-right: ${({ theme }) => theme.spacing(3)};
  @media (max-width: ${Breakpoints.MOBILE}px) {
    margin-right: 0;
  }
`
const StyledNavigationRightAlign = styled(Navigation.RightAlign)`
  justify-content: start;
  width: 100%;
  div > {
    margin-left: 2px;
  }
`
const StyledNavigationDetailBar = styled(Navigation.DetailBar)`
  justify-content: space-between;
  div > {
    margin-left: 2px;
  }
`

const MobileNavigationDetailBar = ({ setSaveState, saveState, undo, redo, triggerFreeFlowAction }) => {
  const singleSpaContext = React.useContext(SingleSpaContext)
  const { showPreview, downloadLogo, activeSegment } = useEditorContext()
  const navigate = useNavigate()
  const isMobile = useMediaQuery({ query: `(min-width: ${Breakpoints.LARGE_DESKTOP}px)` })
  const siteId = getQueryParametersFromUrl(window.location.href).siteId
  const isFromEditor = () => !isNil(siteId)
  const goToExpressEditor = () => goToWithHistory(navigate, getUrl(siteNames.RESPONSIVE_EDITOR, `/site/${siteId}`))
  const isInParcel = singleSpaContext.properties != null
  const isMerchTab = activeSegment === 'merch'

  return (
    <StyledNavigationDetailBar>
      <Navigation.LeftAlign>
        {isInParcel ? (
          <Navigation.BackButton onClick={singleSpaContext.properties.onClose} icon='close' />
        ) : (
          <LogoBackButton onClick={isFromEditor() ? goToExpressEditor : undefined} />
        )}
      </Navigation.LeftAlign>
      {/* <Navigation.CenterAlign /> */}
      <StyledNavigationRightAlign>
        <Grid
          container
          spacing={2}
          wrap='nowrap'
          sx={{ ml: 2, mr: 2, justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
        >
          <Grid size='auto' container>
            <SaveButtonContainer setSaveState={setSaveState} saveState={saveState} />
          </Grid>
          <Grid size='auto'>
            {!isMerchTab && (
              <StyledActionButton
                icon='tv'
                size='small'
                title='logomakerEditor.actions.preview'
                onClick={showPreview}
                dataElementLocation={DataElementLocations.HEADER}
                dataElementLabel='logo-preview-button'
                dataElementId='logomaker-editor-logo-preview-button'
              />
            )}
          </Grid>
          <Grid size='auto' container>
            {isMerchTab ? (
              <LogoMaker.EditProductButton isInParcel={isInParcel} />
            ) : (
              <LogoMaker.DownloadButton
                isInParcel={isInParcel}
                downloadLogo={(props) => triggerFreeFlowAction('download', () => downloadLogo(props, isMobile))}
              />
            )}
          </Grid>
          <Grid size='auto' container>
            <LogoMaker.UndoRedo undo={undo} redo={redo} />
          </Grid>
        </Grid>
      </StyledNavigationRightAlign>
    </StyledNavigationDetailBar>
  )
}

MobileNavigationDetailBar.propTypes = {
  undo: PropTypes.func.isRequired,
  redo: PropTypes.funcisRequired,
  triggerFreeFlowAction: PropTypes.func.isRequired,
  setSaveState: PropTypes.func,
  saveState: PropTypes.number
}

export default memo(MobileNavigationDetailBar)
