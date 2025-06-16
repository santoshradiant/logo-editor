import React, { useContext, memo } from 'react'

import Grid from '@mui/material/Grid2'

import LogoMakerContext from 'logomaker/context/editor-context'
import Button from '@mui/material/Button'

import get from 'lodash/get'

const SymbolLayoutControl = () => {
  const { updateValueInTemplate, editorTemplate } = useContext(LogoMakerContext)
  const templateKey = 'background.inverse'
  const inverse = get(editorTemplate, templateKey)

  return (
    <Grid container>
      <Grid  size={6}>
        <Button
          fullWidth
          variant='outlined'
          selected={!inverse}
          onClick={() => updateValueInTemplate(templateKey, false)}
        >
          Light
        </Button>
      </Grid>
      <Grid  size={6}>
        <Button
          fullWidth
          variant='outlined'
          inverse
          selected={!!inverse}
          onClick={() => updateValueInTemplate(templateKey, true)}
        >
          Dark
        </Button>
      </Grid>
    </Grid>
  )
}

export default memo(SymbolLayoutControl)
