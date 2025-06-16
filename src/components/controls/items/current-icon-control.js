import React, { memo, useContext, useState } from 'react'
import PropTypes from 'prop-types'

import LogoMakerContext from 'logomaker/context/editor-context'

import SymbolSearch from './symbol-search'
import get from 'lodash/get'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid2'

import Text from '@eig-builder/module-localization'
import 'logomaker/lang'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper'
import CloseIcon from '@mui/icons-material/Close'

const CurrentIconControl = ({ templateKey }) => {
  const logoMakerContext = useContext(LogoMakerContext)
  const [openDialog, setOpenDialog] = useState(false)

  const icon = get(logoMakerContext.editorTemplate, templateKey)
  const url = icon && (icon.previewUrl || icon.url)
  const iconIsHidden = get(logoMakerContext.editorTemplate, 'layout.symbol.position') === 'none'

  const closeDialog = () => {
    setOpenDialog(false)
  }

  const isMobile = useIsMobile()

  return (
    <React.Fragment>
      <Grid container sx={{ justifyContent: 'space-between' }}>
        <Grid container sx={{ justifyContent: 'flex-start' }} >
          <Grid>
            <Button
              variant='outlined'
              color='primary'
              onClick={() => setOpenDialog(true)}
              dataElementLocation={DataElementLocations.LEFT_RAIL}
              dataElementLabel='logo-add--symbol-button'
              dataElementId='logomaker-editor-add-symbol-button'
            >
              <Text message={iconIsHidden ? 'logomaker.addSymbol' : 'logomaker.replace'} />
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={closeDialog} fullScreen={isMobile}>
        <div
          style={
            !isMobile
              ? {
                  overflowX: 'hidden',
                  minWidth: 600,
                  minHeight: 550,
                  maxHeight: 550
                }
              : { overflowX: 'hidden' }
          }
        >
          <React.Fragment>
            <div className='flex-container'>
              <IconButton
                tag='close-select-symbol'
                onClick={closeDialog}
                style={{ float: 'right' }}
                dataElementLocation={DataElementLocations.LEFT_RAIL}
                dataElementLabel='logo-select-button'
                dataElementId='logomaker-editor-logo-select-symbol-button'
              >
                <CloseIcon style={{ width: '25px' }} />
              </IconButton>
              <DialogTitle>
                <Text message='logomaker.segments.symbol.select' />
              </DialogTitle>
            </div>
            <DialogContent style={{ paddingTop: 10 }}>
              <SymbolSearch onClose={closeDialog} selectedIconUrl={url} />
            </DialogContent>
          </React.Fragment>
        </div>
      </Dialog>
    </React.Fragment>
  )
}

CurrentIconControl.propTypes = {
  templateKey: PropTypes.string.isRequired
}

export default memo(CurrentIconControl)
