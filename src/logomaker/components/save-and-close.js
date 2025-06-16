import React, { memo } from 'react'
import PropTypes from 'prop-types'

import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'
import Text from '@eig-builder/module-localization'
import Button from '@mui/material/Button'
import usePrevious from '@eig-builder/core-utils/hooks/usePrevious'

import { useEditorContext } from '../../logomaker/context/editor-context'

import './lang'

const SaveAndClose = ({ setSaveState, saveState, onClose }) => {
  const { unSavedProgress, saveLogo } = useEditorContext()
  const [clicked, setClicked] = React.useState(false)
  const [_, forceRefresh] = React.useState(false)
  const previousSaveState = usePrevious(saveState)

  React.useEffect(() => {
    return () => setClicked(false)
  }, [])

  React.useEffect(() => {
    if (previousSaveState === 1 && saveState === 0 && clicked) {
      onClose()
    }
  }, [previousSaveState, saveState, clicked])

  const disabled = saveState < 2

  const saveLogoFunc = async () => {
    setClicked(true)
    if (disabled) {
      onClose()
      return
    }

    setSaveState(1)

    await saveLogo(() => setSaveState(0))
    forceRefresh(!_)
  }

  React.useEffect(() => {
    if (unSavedProgress) {
      setSaveState(2)
    } else {
      setSaveState(0)
    }
  }, [unSavedProgress, setSaveState, _])

  return (
    <Button
      onClick={saveLogoFunc}
      variant='contained'
      dataElementLocation={DataElementLocations.HEADER}
      dataElementLabel='logo--header--saveClose'
      dataElementId='logo--header--saveClose'
    >
      <Text message={saveState === 1 ? 'logomakerEditor.actions.saving' : 'logomakerEditor.actions.saveAndClose'} />
    </Button>
  )
}

SaveAndClose.propTypes = {
  setSaveState: PropTypes.func.isRequired,
  saveState: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired
}

export default memo(SaveAndClose)
