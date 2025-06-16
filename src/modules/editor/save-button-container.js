import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { LogoMaker } from 'logomaker'

import Text from '@eig-builder/module-localization'
import 'logomaker/lang'

import { useEditorContext } from 'logomaker/context/editor-context'

const isComingFromEE = () => window.location.search.includes('editor=1')

const SaveButtonContainer = ({ setSaveState, saveState, iconButton, onClickCallBack }) => {
  const { unSavedProgress, saveLogo } = useEditorContext()
  const [_, forceRefresh] = React.useState(false)

  const disabled = saveState < 2

  const saveLogoFunc = async () => {
    if (disabled) {
      return
    }

    setSaveState(1)

    await saveLogo(() => {
      setSaveState(0)
      onClickCallBack?.()
    })
    forceRefresh(!_)
  }

  React.useEffect(() => {
    if (unSavedProgress) {
      setSaveState(2)
    } else {
      setSaveState(0)
    }
  }, [unSavedProgress, setSaveState, _])

  if (!isComingFromEE()) {
    return (
      <LogoMaker.SaveButton
        onClick={saveLogoFunc}
        saved={saveState === 0}
        saving={saveState === 1}
        pendingChanges={saveState === 2}
      />
    )
  }

  return (
    <LogoMaker.SaveButton
      saved={saveState === 0}
      saving={saveState === 1}
      pendingChanges={saveState === 2}
      onClick={saveLogoFunc}
      onClickCallBack={() => window.close()}
      label={<Text message='logomaker.expresseditor.save' />}
      iconButton={iconButton}
    />
  )
}

SaveButtonContainer.propTypes = {
  setSaveState: PropTypes.func.isRequired,
  saveState: PropTypes.number.isRequired,
  onClickCallBack: PropTypes.func,
  iconButton: PropTypes.bool
}

export default memo(SaveButtonContainer)
