import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import Text from '@eig-builder/module-localization'

import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

import '../lang'

import Button from '@mui/material/Button'

import { styled } from '@mui/material/styles'
import { useEditorContext } from 'logomaker/context/editor-context'

const StyledButton = styled(Button)`
  ${({ $isMobile }) =>
    $isMobile &&
    `
    right: 20px;
  `}
`
StyledButton.defaultProps = {
  variant: 'contained'
}

const PreviewButton = ({ onClick }) => {
  const isMobile = useIsMobile()
  const { isSavingLogo } = useEditorContext()

  return (
    <StyledButton
      onClick={onClick}
      loading={isSavingLogo}
      dataElementLocation={DataElementLocations.HEADER}
      dataElementLabel='logomaker.preview'
      dataElementId='logomaker-editor-logo-preview-button'
      color='primary'
      $isMobile={isMobile}
    >
      <Text message={isSavingLogo ? 'Saving...' : 'logomaker.preview'} />
    </StyledButton>
  )
}
PreviewButton.propTypes = {
  onClick: PropTypes.func.isRequired
}
export default memo(PreviewButton)
