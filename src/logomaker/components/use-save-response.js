import React from 'react'

import { useLocalize } from '@eig-builder/module-localization'

import '../lang'

function useSaveResponse ({ saving, saved, pendingChanges, saveText = null }) {
  const [title, setTitle] = React.useState('')
  const [disabled, setDisabled] = React.useState(false)

  const { localize } = useLocalize()

  React.useEffect(() => {
    if (saving) {
      setTitle(localize('logomaker.saving'))

      if (!disabled) {
        setDisabled(true)
      }
    } else if (saved && !pendingChanges) {
      setTitle(localize('logomaker.saved'))

      if (!disabled) {
        setDisabled(true)
      }
    } else {
      setTitle(saveText || localize('logomaker.save'))

      if (disabled) {
        setDisabled(false)
      }
    }
  }, [saving, saved, pendingChanges])

  return {
    title,
    disabled
  }
}
export default useSaveResponse
