import React, { useState } from 'react'
import PropTypes from 'prop-types'
import usePostAsJson from '@eig-builder/core-utils/hooks/usePostAsJson'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import { api } from '@eig-builder/core-utils/helpers/url-helper'
import TextField from '@mui/material/TextField'
import { DataElementLocations, DataElementTypes } from '@eig-builder/core-utils/helpers/tagging-helper'
import Text from '@eig-builder/module-localization'

function LogoShareDialog({ open, onClose, shareModalId }) {
  const [shareEmail, setShareEmail] = useState()
  const [state, doRequest] = usePostAsJson()

  React.useEffect(() => {
    onClose()
  }, [state.isSuccess])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Text message='logomakerEditor.shareModal.title' />
      </DialogTitle>
      <DialogContent>
        <Text message='logomakerEditor.shareModal.description' className='mb-3' />
        <div className='d-flex justify-content-center align-items-center mt-3'>
          {state.isLoading ? (
            <Box sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              <CircularProgress />
            </Box>
          ) : (
            <TextField
              dataElementLocation={DataElementLocations.HEADER}
              dataElementLabel='logomaker-share-logo'
              dataElementId='logomaker-my-logos-share-dialog-email'
              onChange={(e) => setShareEmail(e.target.value)}
              className='mt-3'
              variant='outlined'
              type='email'
              label='Email address'
              placeholder='Email address'
              fullWidth
            />
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() =>
            doRequest(
              {
                target_email_address: shareEmail
              },
              {
                url: api(`v1.0/logos/${shareModalId}/transfer`)
              }
            )
          }
          color='secondary'
          dataElementType={DataElementTypes.BUTTON}
          dataElementLocation={DataElementLocations.POP_UP}
          dataElementId='logomakerEditor.eeModal.ok'
          dataElementLabel='logo-save-dialog'
        >
          <Text message='logomakerEditor.shareModal.button' />
        </Button>
      </DialogActions>
    </Dialog>
  )
}
LogoShareDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  shareModalId: PropTypes.number
}
LogoShareDialog.defaultProps = {
  open: false
}

export default LogoShareDialog
