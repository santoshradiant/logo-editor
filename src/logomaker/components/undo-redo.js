import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import ActionButton from '@eig-builder/compositions-action-button'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

// Icons
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'

const StyledActionButton = styled(ActionButton)`
  margin-right: ${({ theme, isMobile }) => theme.spacing(isMobile ? 5 : 1)};
`

const UndoRedo = ({ undo, redo }) => {
  const isMobile = useIsMobile()
  return (
    <>
      <StyledActionButton
        icon={<UndoIcon />}
        onClick={undo}
        dataElementLocation={DataElementLocations.HEADER}
        dataElementLabel='logo--header--undo'
        dataElementId='logo--header--undo'
        width={isMobile ? '16px' : undefined}
        isMobile={isMobile}
      />
      <StyledActionButton
        icon={<RedoIcon />}
        onClick={redo}
        dataElementLocation={DataElementLocations.HEADER}
        dataElementLabel='logo--header--redo'
        dataElementId='logo--header--redo'
        width={isMobile ? '16px' : undefined}
        isMobile={isMobile}
      />
    </>
  )
}

UndoRedo.propTypes = {
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired
}

export default memo(UndoRedo)
