import React, { useState, useEffect, memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import Grid from '@mui/material/Grid2'
import shuffle from 'lodash/shuffle'

const BORDER = 'rgba(200,202,196)'
const WHITE = 'rgba(255, 255, 255)'

const StyledGridContainer = styled(Grid)`
  border-radius: 4px;
  padding: 1px;
  cursor: pointer;
  border: ${props => (props.selected ? `1px solid ${props.theme.palette.primary.main}` : `1px solid ${BORDER}`)};
  overflow: hidden;
  box-shadow: ${props =>
    props.selected
      ? `0 0 0 1px ${props.theme.palette.primary.main}, inset 0 0 0 1px ${WHITE}, 0 3px 6px ${BORDER}`
      : 'none'};
  &:hover {
    border: ${props => `1px solid ${props.theme.palette.primary.main}`};
  }
`

const ColorPalettes = ({ style, currentTab, showAmount, onClick }) => {
  const [selectedPalette, setSelectedPalette] = useState()
  // reset selected color palette when changing tab
  useEffect(() => {
    setSelectedPalette(null)
  }, [currentTab])

  const handlePaletteClick = (palette, category, index) => {
    // don't do anything when clicking twice on the already selected palette
    if (selectedPalette !== index) {
      setSelectedPalette(index)
      const originalPalette = [palette[2], palette[3], palette[0], palette[1]]
      onClick(category, originalPalette)
    }
  }

  // set the first 2 colors in the back and the 3rd and 4th color to the front in the palette
  const changeOrder = array => {
    return ([array[0], array[1], array[2], array[3]] = [array[2], array[3], array[0], array[1]])
  }

  // palettes randomizes everytime when opening the popup
  const randomPalettes = useMemo(() => shuffle(style), [style])
  const shuffleArray = useMemo(() => randomPalettes.map(colors => changeOrder(colors)), [currentTab]) // eslint-disable-line

  return (
      <Grid container spacing={2}>
        {shuffleArray.slice(0, showAmount).map((colors, index) => (
          <Grid
            key={index}
            size={12}
            onClick={() => handlePaletteClick(colors, currentTab, index)}
            className='logo-color-pallette-item'
          >
            <StyledGridContainer container selected={selectedPalette === index}>
              {colors.map((color, index) => (
                <Grid
                  key={index}
                  size='grow'
                  sx={{
                    backgroundColor: color,
                    height: 30
                  }}
                />
              ))}
            </StyledGridContainer>
          </Grid>
        ))}
      </Grid>
  )
}

ColorPalettes.propTypes = {
  style: PropTypes.array,
  currentTab: PropTypes.number,
  showAmount: PropTypes.number,
  onClick: PropTypes.func.isRequired
}

export default memo(ColorPalettes)
