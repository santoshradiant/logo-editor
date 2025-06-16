import React, { memo, Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import get from 'lodash/get'
import set from 'lodash/set'

import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Text from '@eig-builder/module-localization'
import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import Typography from '@mui/material/Typography'

import { useEditorContext } from 'logomaker/context/editor-context'
import useSymbolSearch, { SYMBOL_STATE } from 'hooks/useSymbolSearch'

import 'logomaker/lang'

const initialLoadIcons = -1
const initialIconCount = 18

const SymbolContainer = styled('div')`
  overflow: ${(props) => (props.scrollable ? 'auto' : 'hidden')};
  overflow-x: hidden;
  margin: 20px;
  margin-left: 0;
  margin-right: 0;
  max-height: ${(initialLoadIcons / 3) * 81}px;
`

const Symbol = styled('div')`
  background: url(${(props) => props.url}) no-repeat center center;
  background-size: ${(props) => (props.svg ? '100% 100%' : 'contain')};
  width: 48px;
  height: 48px;
`

const SymbolPlaceHolder = styled('div')`
  display: flex;
  justify-content: center;
  height: 100%;
  border-radius: 10%;
  cursor: pointer;
  padding: 20px;
  background-color: #ebebeb;
  border: ${(props) => (props.selected ? '1px solid black' : '')};

  &:hover {
    background-color: white;
  }
`

const NoIcons = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

const ModalSectionTitle = styled(Typography)`
  font-weight: 900;
  font-size: 18px;
  padding-top: ${({ theme }) => theme.spacing(6)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`

const ShowMoreLessButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`
ShowMoreLessButton.defaultProps = { variant: 'text', color: 'primary' }

const SymbolControls = ({ onClose, selectedIconUrl }) => {
  const { editorTemplate, setTemplateActive } = useEditorContext()
  const [symbolIcons, setSymbolIcons] = useState(null)
  const [initialIcons, setInitialIcons] = useState(null)
  const [showMoreIcons, setShowMoreIcons] = useState(false)
  const [showMoreInitials, setShowMoreInitials] = useState(false)

  const { search, setSearchValue, icons, initials, iconState, initialState } = useSymbolSearch()

  useEffect(() => {
    const newSymbolIcons = [...icons]
    if (!showMoreIcons) {
      const tempSymbols = newSymbolIcons?.slice(0, initialIconCount)
      setSymbolIcons(tempSymbols)
    } else {
      setSymbolIcons(newSymbolIcons)
    }
    const newInitialIcons = [...initials]
    if (!showMoreInitials) {
      const tempInitials = newInitialIcons?.slice(0, initialIconCount)
      setInitialIcons(tempInitials)
    } else {
      setInitialIcons(newInitialIcons)
    }
  }, [icons, initials, showMoreIcons, showMoreInitials])

  const selectIcon = (icon) => {
    // clone template
    const newTemplate = { ...editorTemplate }

    const position = get(editorTemplate, 'layout.symbol.position')

    if (icon.preview_url) {
      set(newTemplate, 'symbol.icon', {
        id: icon.id,
        type: 'external',
        url: icon.svg_url,
        previewUrl: icon.preview_url
      })
    } else {
      set(newTemplate, 'symbol.icon', {
        fontId: icon.fontId,
        id: icon.id,
        type: 'initials',
        initials: icon.initials,
        url: '',
        previewUrl: ''
      })
    }

    if (!position || position === 'none') {
      set(newTemplate, 'layout.symbol', {
        decoration: 'none',
        position: 'top'
      })
    }

    setTemplateActive(newTemplate)
    onClose()
  }

  const getSvg = (icon) => {
    if (!icon.stored) {
      return ''
    }
    return 'data:image/svg+xml,' + window.escape(icon.stored)
  }

  const isMobile = useIsMobile()
  const cols = isMobile ? 4 : 2

  return (
    <Fragment>
      <TextField
        onChange={(e) => setSearchValue(e.target.value)}
        variant='outlined'
        style={{ height: 40 }}
        value={search}
        label={<Text message='logomaker.symbolSearch.label' />}
      />
      <SymbolContainer scrollable={false}>
        <ModalSectionTitle variant='body1'>
          <Text message='logomakerEditor.icons' />
        </ModalSectionTitle>
        {iconState === SYMBOL_STATE.NORESULTS && (
          <NoIcons>
            <Typography variant='body1' gutterBottom>
              {search?.length > 0 ? (
                <Text message='logomakerEditor.noSymbolResult' values={[search]} />
              ) : (
                <Text message='logomakerEditor.noSymbolEmpty' />
              )}
            </Typography>
          </NoIcons>
        )}
        {iconState === SYMBOL_STATE.RETRIEVING && (
          <Box sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
            <CircularProgress />
          </Box>
        )}
        {iconState === SYMBOL_STATE.RESULTS && (
          <>
            <Grid container spacing={1}>
              {symbolIcons &&
                symbolIcons.map((icon) => (
                  <Grid  key={icon.id} size={cols} onClick={() => selectIcon(icon)}>
                    <SymbolPlaceHolder selected={selectedIconUrl === icon.preview_url}>
                      <Symbol url={icon.preview_url || getSvg(icon)} svg={!icon.preview_url} />
                    </SymbolPlaceHolder>
                  </Grid>
                ))}
            </Grid>
            {icons.length > initialIconCount && (
              <ShowMoreLessButton onClick={() => setShowMoreIcons((prev) => !prev)}>
                {showMoreIcons ? (
                  <Text message='logomakerEditor.showLess' />
                ) : (
                  <Text message='logomakerEditor.showAll' />
                )}
              </ShowMoreLessButton>
            )}
          </>
        )}
        <ModalSectionTitle variant='body1'>
          <Text message='logomakerEditor.initials' />
        </ModalSectionTitle>
        {initialState === SYMBOL_STATE.NORESULTS && (
          <NoIcons>
            <Typography variant='body1' gutterBottom>
              {search?.length > 0 ? (
                <Text message='logomakerEditor.noInitialResult' values={[search]} />
              ) : (
                <Text message='logomakerEditor.noInitialEmpty' />
              )}
            </Typography>
          </NoIcons>
        )}
        {initialState === SYMBOL_STATE.RETRIEVING && (
          <Box sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
            <CircularProgress />
          </Box>
        )}
        {initialState === SYMBOL_STATE.RESULTS && (
          <>
            <Grid container spacing={1}>
              {initialIcons &&
                initialIcons.map((icon) => (
                  <Grid onClick={() => selectIcon(icon)}  key={icon.id} size={cols}>
                    <SymbolPlaceHolder selected={selectedIconUrl === icon.preview_url}>
                      <Symbol url={icon.preview_url || getSvg(icon)} svg={!icon.preview_url} />
                    </SymbolPlaceHolder>
                  </Grid>
                ))}
            </Grid>
            {initials.length > initialIconCount && (
              <ShowMoreLessButton onClick={() => setShowMoreInitials((prev) => !prev)}>
                {showMoreInitials ? (
                  <Text message='logomakerEditor.showLess' />
                ) : (
                  <Text message='logomakerEditor.showAll' />
                )}
              </ShowMoreLessButton>
            )}
          </>
        )}
      </SymbolContainer>
    </Fragment>
  )
}

SymbolControls.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedIconUrl: PropTypes.string
}

export default memo(SymbolControls)
