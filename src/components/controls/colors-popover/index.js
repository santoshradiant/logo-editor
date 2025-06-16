import React, { useState, useEffect, memo, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import { DataElementLocations, DataElementTypes } from '@eig-builder/core-utils/helpers/tagging-helper'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import Popover from '@mui/material/Popover'
import ColorPalettes from './color-palette'

// import IconButton from '@mui/material/IconButton'
// import CloseIcon from '@mui/icons-material/Close'

import Text from '@eig-builder/module-localization'
import 'logomaker/lang'

import Tabs from '@eig-builder/compositions-responsive-tabs'
import capitalize from 'lodash/capitalize'

const INCREASE_AMOUNT = 8

const RelativeTabBox = styled('div')`
  position: relative;
  width: 100%;
  /* height: 50px; */
  justify-content: center;
  display: flex;
  border-bottom: 1px solid #e9e9e9;
  /* margin: 0 -8px; */
  /* Hack for the tabs component */
  .container {
    display: contents;
  }
`

const StyledPaletteContainer = styled('div')`
  height: 304px;
  padding: 16px 8px;
  overflow-y: scroll;
  overflow-x: hidden;
`

const StyledFooter = styled(Grid)`
  /* position: absolute; */
  /* bottom: 0; */
  /* left: 0; */
  /* height: 48px; */
  width: 100%;
  border-top: 1px solid #e9e9e9;
  background: #ffffff;
`

const StyledFooterInner = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px;
  @media screen and (max-width: 720px) {
    justify-content: flex-end;
  }
`

// const StyledButton = styled(Button)``
// StyledButton.defaultProps = { variant: 'outlined' }
const ColorsPopover = ({ handleClose, amount, onClick, colorTheme, open, children }) => {
  const [showAmount, setShowAmount] = useState(amount)
  const [currentTab, setCurrentTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const isMobile = useIsMobile()
  const rootRef = useRef()
  const palette = {}

  // reset amount to show for color palettes when switching tab
  useEffect(() => {
    setShowAmount(amount)
  }, [amount, currentTab])

  const getItemAtIndex = useCallback(
    (index) => rootRef.current?.querySelectorAll('.logo-color-pallette-item')?.[index],
    []
  )

  const scrollToItem = useCallback((index, block = 'start') => {
    setTimeout(() => {
      getItemAtIndex(index)?.scrollIntoView?.({
        behavior: 'smooth',
        block
      })
    }, 150)
  }, [])

  Object.keys(colorTheme.ColorGroups).forEach((key) => {
    colorTheme.ColorGroups[key].map((group) => {
      if (!palette[group.style]) {
        palette[group.style] = []
      }
      palette[group.style].push(group.palette.map((color) => color))
    })
  })

  // e.g. 'Bright' with all the palettes
  const style = Object.values(palette)[currentTab]

  const tabs = Object.keys(palette).map((style, index) => ({
    label: capitalize(style),
    key: index
  }))

  const reachedTheEnd = showAmount > Object.values(palette)[currentTab].length - 1

  return (
    <>
      <div ref={(ref) => setAnchorEl(ref)}>{children}</div>
      <Popover
        ref={rootRef}

        onClose={handleClose}
        id='color-popover'
        open={open}
        anchorEl={anchorEl}
        slotsProps={{
          root: {
            maxWidth: '360px'
          },
          backdrop: { invisible: true }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Grid
          container
          direction={'column'}
          sx={(theme) => ({
            width: '360px',
            maxWidth: '360px',
            padding: theme.spacing(2),
            [theme.breakpoints.down('sm')]: {
              width: '100vw'
            }
          })}
        >
          <Grid size='auto'>
            <RelativeTabBox>
              <Tabs
                tabs={tabs}
                value={currentTab}
                handleChange={(currentTab) => setCurrentTab(currentTab)}
                dataElementType={DataElementTypes.TAB}
                dataElementLocation={DataElementLocations.LEFT_RAIL}
                dataElementId='logomaker.colorsPopover.tabs'
                dataElementIdPrefix='logomaker.colorsPopover'
                dataElementLabel='logo-colors-popover'
                dataElementLabelPrefix='logo-colors'
              />
            </RelativeTabBox>
          </Grid>
          <Grid size='grow'>
            <StyledPaletteContainer size='grow'>
              <ColorPalettes currentTab={currentTab} style={style} showAmount={showAmount} onClick={onClick} />
            </StyledPaletteContainer>
          </Grid>
          <Grid size='auto'>
            <StyledFooter>
              <StyledFooterInner>
                <Button
                  onClick={() => {
                    setShowAmount(showAmount + INCREASE_AMOUNT)
                    scrollToItem(showAmount)
                  }}
                  variant='outlined'
                  disabled={reachedTheEnd}
                  dataElementType={DataElementTypes.BUTTON}
                  dataElementLocation={DataElementLocations.POP_UP}
                  dataElementId='logomaker.colorsPopover.loadMore'
                  dataElementLabel='logo-colors-dialog'
                >
                  <Text message='logomaker.colorsPopover.loadMore' />
                </Button>
              </StyledFooterInner>
            </StyledFooter>
          </Grid>
        </Grid>
      </Popover>
    </>
  )
}

ColorsPopover.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
  amount: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  colorTheme: PropTypes.any.isRequired,
  children: PropTypes.node
}

export default memo(ColorsPopover)
