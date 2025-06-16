import React from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'

import Button from '@mui/material/Button'
import { DataElementLocations, DataElementTypes } from '@eig-builder/core-utils/helpers/tagging-helper'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Text from '@eig-builder/module-localization'
import './lang'
import CloseIcon from '@mui/icons-material/Close'

const CloseButton = styled(IconButton)`
  position: absolute !important;
  top: 0;
  right: 0;
`

const StyledDialogTitle = styled(Typography)`
  padding: ${({ theme }) => theme.spacing(4)};
  margin-right: 50px !important;
  margin-bottom: 8px !important;
  font-weight: normal;
`
StyledDialogTitle.defaultProps={
 variant: 'h3'
}
const SaveDialog = ({ open, handleCancel, handleNo, handleYes }) => {
  return (
    <Dialog open={open} onClose={handleCancel}>
      <StyledDialogTitle>
        <Text message='logomakerEditor.saveModal.title' />
      </StyledDialogTitle>
      <CloseButton onClick={handleCancel}>
        <CloseIcon />
      </CloseButton>
      <DialogActions>
        <Button
          onClick={handleNo}
          color='primary'
          dataElementType={DataElementTypes.BUTTON}
          dataElementLocation={DataElementLocations.POP_UP}
          dataElementId='logomakerEditor.saveModal.no'
          dataElementLabel='logo-save-dialog'
          variant='outlined'
        >
          <Text message='logomakerEditor.saveModal.no' />
        </Button>
        <Button
          onClick={handleYes}
          color='primary'
          variant='contained'
          dataElementType={DataElementTypes.BUTTON}
          dataElementLocation={DataElementLocations.POP_UP}
          dataElementId='logomakerEditor.saveModal.yes'
          dataElementLabel='logo-save-dialog'
        >
          <Text message='logomakerEditor.saveModal.yes' />
        </Button>
      </DialogActions>
    </Dialog>
  )
}

SaveDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleNo: PropTypes.func.isRequired,
  handleYes: PropTypes.func.isRequired
}

export default SaveDialog
