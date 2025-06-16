import React from 'react'
import PropTypes from 'prop-types'
import isNil from 'lodash/isNil'
import { SingleSpaContext } from 'single-spa-react'

import { getRuntimeConfig } from '@eig-builder/core-utils/helpers/runtime-config-helper'
import { getQueryParametersFromUrl } from '@eig-builder/core-utils/helpers/url-helper'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { Navigation } from '@eig-builder/module-navigation'

import { LogoMaker } from '../../../logomaker'
import LogoBackButton from '../../../logomaker/components/logo-back-button'
import SaveButtonContainer from '../save-button-container'
import DropDownMenu from '../../../logomaker/components/drop-down-menu'
import { useEditorContext } from '../../../logomaker/context/editor-context'
import BackToExpressButton from 'modules/onboarding/components/back-to-express-button'

import './../../../logomaker/lang'

const DesktopNavigationDetailBar = ({ setSaveState, saveState, undo, redo, triggerFreeFlowAction }) => {
  const context = React.useContext(SingleSpaContext)
  const { showPreview, downloadLogo, activeSegment } = useEditorContext()
  const isMobile = useIsMobile()

  const siteId = getQueryParametersFromUrl(window.location.href).siteId
  const isFromEditor = () => !isNil(siteId)
  const partnerId = getRuntimeConfig()?._partnerId || Number.MAX_SAFE_INTEGER
  const isInParcel = context.properties != null
  const isMerchTab = activeSegment === 'merch'

  return (
    <Navigation.DetailBar>
      <Navigation.LeftAlign>
        {isFromEditor() ? (
          <BackToExpressButton siteId={siteId} />
        ) : !isInParcel ? (
          <LogoBackButton />
        ) : (
          <Navigation.BackButton onClick={context.properties.onClose} icon='close' />
        )}
        <Navigation.Spacer spacing='32px' />
        <LogoMaker.UndoRedo undo={undo} redo={redo} />
        <Navigation.Spacer spacing='4px' />
        <SaveButtonContainer setSaveState={setSaveState} saveState={saveState} />
        <Navigation.Spacer spacing='4px' />
        {!isMerchTab && <LogoMaker.PreviewButton onClick={showPreview} />}
      </Navigation.LeftAlign>
      <Navigation.CenterAlign />
      <Navigation.RightAlign>
        {isMerchTab ? (
          <LogoMaker.EditProductButton isInParcel={isInParcel} />
        ) : (
          <LogoMaker.DownloadButton
            isInParcel={isInParcel}
            downloadLogo={(props) => triggerFreeFlowAction('download', () => downloadLogo(props, isMobile))}
          />
        )}
        <Navigation.Spacer spacing='8px' />
        {isInParcel && (
          <LogoMaker.SaveAndClose
            setSaveState={setSaveState}
            saveState={saveState}
            onClose={context.properties.onClose}
          />
        )}
        {partnerId < 100 && <DropDownMenu icon='help' />}
      </Navigation.RightAlign>
    </Navigation.DetailBar>
  )
}

DesktopNavigationDetailBar.propTypes = {
  undo: PropTypes.func,
  redo: PropTypes.func,
  triggerFreeFlowAction: PropTypes.func,

  setSaveState: PropTypes.func,
  saveState: PropTypes.number
}

export default DesktopNavigationDetailBar
