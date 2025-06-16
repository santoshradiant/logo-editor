import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useEditorContext } from './../../../logomaker/context/editor-context'

import MobileNavigationDetailBar from './mobile-navigation-detail-bar'
import DesktopNavigationDetailBar from './desktop-navigation-detail-bar'

import WIDTH_BREAKPOINTS, { useMediaQuery } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

const NavigationWithContextContainer = ({ undo, redo, triggerFreeFlowAction }) => {
  const { setUnSavedProgress } = useEditorContext()
  const [saveState, setSaveState] = useState(0)
  const isMobile = useMediaQuery({ query: `(max-width: ${WIDTH_BREAKPOINTS.LARGE_DESKTOP}px)` })

  const undoAction = React.useCallback(() => {
    setSaveState(2)
    setUnSavedProgress(true)
    undo()
  }, [undo])

  const redoAction = React.useCallback(() => {
    setSaveState(2)
    setUnSavedProgress(true)
    redo()
  }, [redo])

  return isMobile ? (
    <MobileNavigationDetailBar
      undo={undoAction}
      redo={redoAction}
      triggerFreeFlowAction={triggerFreeFlowAction}
      setSaveState={setSaveState}
      saveState={saveState}
    />
  ) : (
    <DesktopNavigationDetailBar
      undo={undoAction}
      redo={redoAction}
      triggerFreeFlowAction={triggerFreeFlowAction}
      setSaveState={setSaveState}
      saveState={saveState}
    />
  )
}

NavigationWithContextContainer.propTypes = {
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired,
  triggerFreeFlowAction: PropTypes.func.isRequired
}

export default NavigationWithContextContainer
