import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import Button from '@mui/material/Button'
import { useEditorContext } from '../context/editor-context'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'

import Breakpoints, { useMediaQuery, useIsTablet } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import ActionButton from '@eig-builder/compositions-action-button'
import { useDownload } from 'modules/application-config/features'

import Text from '@eig-builder/module-localization'
import '../lang'

const StyledButtonWrapper = styled('div')`
  margin-right: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${Breakpoints.MOBILE}px) {
    margin-right: ${({ theme }) => theme.spacing(4)};
  }
`

const DownloadButton = ({ iconButton, skipMobileButton, isInParcel }) => {
  const download = useDownload()

  const { selectedLogo, saveLogo, unSavedProgress, logoSaved, isSavingLogo } = useEditorContext()
  const isMobile = useMediaQuery({ query: `(max-width: ${Breakpoints.LARGE_DESKTOP}px)` })
  const isTablet = useIsTablet() && window.orientation === 0

  const saveIfNeeded = () => {
    if (unSavedProgress) {
      saveLogo(() => download(selectedLogo.id, isMobile))
    } else {
      download(selectedLogo.id, isMobile)
    }
  }

  if ((iconButton || isMobile || isTablet) && !skipMobileButton) {
    return (
      <StyledButtonWrapper>
        <ActionButton
          padding={0}
          icon='arrow_downward'
          title='Download'
          onClick={saveIfNeeded}
          className='logomaker-editor-logo-download-button'
        />
        {/* <SquareIconButton
          onClick={saveIfNeeded}
          variant='primary'
          icon='arrow_downward'
          dataElementLocation={DataElementLocations.HEADER}
          dataElementLabel='logo-download-button'
          dataElementId='logomaker-editor-logo-download-button'
      /> */}
      </StyledButtonWrapper>
    )
  }

  return (
    <>
      <Button
        onClick={saveIfNeeded}
        loading={isSavingLogo}
        variant={isInParcel ? 'outlined' : 'contained'}
        dataElementLocation={DataElementLocations.HEADER}
        dataElementLabel='logo-download-button'
        dataElementId='logomaker-editor-logo-download-button'
        disabled={!logoSaved.toString()}
      >
        {isSavingLogo ? 'Saving...' : <Text message='logomakerEditor.download' />}
      </Button>
    </>
  )
}

DownloadButton.defaultProps = {
  iconButton: false,
  skipMobileButton: false,
  isInParcel: false
}

DownloadButton.propTypes = {
  iconButton: PropTypes.bool,
  skipMobileButton: PropTypes.bool,
  isInParcel: PropTypes.bool
}

export default memo(DownloadButton)
