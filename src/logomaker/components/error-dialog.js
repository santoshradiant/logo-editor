import React from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'

import Button from '@mui/material/Button'
import { DataElementLocations, DataElementTypes } from '@eig-builder/core-utils/helpers/tagging-helper'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Text from '@eig-builder/module-localization'
import './lang'

const CloseButton = styled(IconButton)`
  position: absolute !important;
  top: 0;
  right: 0;
`

const StyledDialogTitle = styled(DialogTitle)`
  padding-right: 20px;
  margin-right: 50px !important;
  margin-bottom: 8px !important;
`

const ErrorDialog = ({ open, handleCancel, message }) => {
  return (
    <Dialog open={open} onClose={handleCancel}>
      <StyledDialogTitle>
        <Text message='logomakerEditor.eeModal.title' />
      </StyledDialogTitle>
      <CloseButton onClick={handleCancel}>
        <CloseIcon />
      </CloseButton>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color='secondary'
          dataElementType={DataElementTypes.BUTTON}
          dataElementLocation={DataElementLocations.POP_UP}
          dataElementId='logomakerEditor.eeModal.ok'
          dataElementLabel='logo-save-dialog'
        >
          <Text message='logomakerEditor.eeModal.ok' />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ErrorDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.any.isRequired,
  handleCancel: PropTypes.func.isRequired
}

export default ErrorDialog
