import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'

import Button from '@mui/material/Button'
import { DataElementLocations, DataElementTypes } from '@eig-builder/core-utils/helpers/tagging-helper'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

import IconButton from '@mui/material/IconButton'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

import Text from '@eig-builder/module-localization'
import './lang'

import ColorTheme from './../../config/color-theme.json'
import LogoMakerContext from './../../context/editor-context'
import CloseIcon from '@mui/icons-material/Close'



const CustomDialog = styled(Dialog)`
  max-height: 800px;
  width: 800px;
`
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

const ColorsDialog = ({ open, handleCancel }) => {
  const palette = {}

  Object.keys(ColorTheme.ColorGroups).forEach((key) => {
    ColorTheme.ColorGroups[key].map((group) => {
      if (!palette[group.style]) {
        palette[group.style] = []
      }
      palette[group.style].push(group.palette.map((color) => color))
    })
  })

  const logoMakerContext = useContext(LogoMakerContext)
  const handlePaletteClick = (palette, category) => {
    // REFACTOR -- will be overwritten by color.palette
    logoMakerContext.updateValueInTemplate('color.colorCategory', category)
    // works
    logoMakerContext.updateValueInTemplate('color.palette', palette)
  }

  return (
    <CustomDialog  open={open} onClose={handleCancel}>
      <StyledDialogTitle>
        <Text message='logomakerEditor.colorsDialog.title' />
      </StyledDialogTitle>

      <CloseButton onClick={handleCancel}>
        <CloseIcon />
      </CloseButton>
      <DialogContent>
        {Object.keys(palette).map((style, index) => (
          <Grid container key={index}>
            <Grid size={'grow'}>
              <Typography variant='h6' gutterBottom>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </Typography>
            </Grid>
            <Grid container spacing={2} size='auto'>
              {palette[style].map((colors, index) => (
                <Grid key={index} size={4} onClick={() => handlePaletteClick(colors, style)}>
                  <Grid
                    container
                    sx={{
                      borderRadius: 4,
                      cursor: 'pointer',
                      border: '1px solid rgba(200,202,196)'
                    }}
                  >
                    {colors.map((color, index) => (
                      <Grid
                        key={index}
                        size='grow'
                        sx={{
                          backgroundColor: color,
                          height: 36
                        }}
                      />
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color='secondary'
          dataElementType={DataElementTypes.BUTTON}
          dataElementLocation={DataElementLocations.POP_UP}
          dataElementId='logomakerEditor.colorsDialog.cancel'
          dataElementLabel='logo-colors-dialog'
        >
          <Text message='logomakerEditor.colorsDialog.cancel' />
        </Button>
      </DialogActions>
    </CustomDialog>
  )
}

ColorsDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleCancel: PropTypes.func.isRequired
}

export default ColorsDialog
