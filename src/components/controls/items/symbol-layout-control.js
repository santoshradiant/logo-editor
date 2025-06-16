import React, { useContext, memo } from 'react'
import LogoMakerContext from 'logomaker/context/editor-context'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Config from 'logomaker/config/symbol-layouts'
import { Box } from '@mui/material'
// import MD from '@eig-builder/core-utils/helpers/mobile-detection-helper'

const StyledImgHover = styled('div')`
  border-radius: 4px;
  width: 100%;
  justify-content: center;
  display: flex;
`
const SvgComponent = styled('img')`
  width: 100%;
  cursor: pointer;
  border: ${({ border, theme }) => (border ? `1px solid ${theme.palette.primary.main}` : 'inherit')};
  @media screen and (max-width: 1024px) and (min-width: 768px) {
    width: 50%;
  }
`

const SymbolLayoutControl = () => {
  const logoMakerContext = useContext(LogoMakerContext)
  return (
    <div>
      <Box>
        <Typography
          style={{
            marginTop: '20px',
            marginBottom: '8px'
          }}
          variant='body1'
        >
          Layouts
        </Typography>
      </Box>
      <Grid container spacing={1} direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        {Config.map(({ name, svg }, index) => {
          const showBorder = logoMakerContext.editorTemplate.layout.symbol.position === name
          return (
            <Grid key={index} size={{ sm: 3, md: 3, lg: 3 }}>
              <StyledImgHover>
                <SvgComponent
                  border={showBorder}
                  src={svg}
                  onClick={() => logoMakerContext.updateValueInTemplate('layout.symbol.position', name)}
                />
              </StyledImgHover>
            </Grid>
          )
        })}
      </Grid>
    </div>
  )
}

export default memo(SymbolLayoutControl)
