import React, { useState, useEffect, useCallback, memo, useContext, useRef } from 'react'
import PropTypes from 'prop-types'

import LogoMaker from 'core/logo-maker/logo-maker'
import { styled } from '@mui/material/styles'
import { css } from '@emotion/react'
import amcore from 'core/logo-maker/amcore'
import Card from '@mui/material/Card'
import classNames from 'classnames'
import CircularProgress from '@mui/material/CircularProgress'
import CheckBoxIcon from 'core/components/checkbox-icon'

import BootstrapperContext from '@eig-builder/module-bootstrapper/contexts/BootstrapperContext'
import Divider from '@mui/material/Divider'

const Grid = styled('div')`
  height: 100%;
  width: 100%;
  overflow-y: auto;
`

const FadeIn = (delay) => css`
  animation: transformer 0.25s ease-in ${(delay + 8) / 8}s 1;
  transform: scale(0);
  animation-fill-mode: forwards;

  @keyframes transformer {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
`

const Overlay = styled('div')`
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(246, 246, 246, 0.8);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;

  &:hover {
    cursor: ${(props) => (props.votingMode ? 'pointer' : 'initial')};
  }
`

const commonStyles = ({ theme, selected, animate, delay }) => `
  border: ${selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent'};
  position: ${selected ? 'relative' : 'initial'};
  overflow: initial;
  transition: border-color 0.3s ease-in-out;

  &:hover {
    border: 2px solid ${theme.palette.primary.main};
  }

  /* Child Element Styles */
  .cs {
    margin: 0 3px;
    padding: 0;
    border: 1px solid gray;
    display: inline-block;
  }

  .cb {
    margin: 0;
    padding: 0;
    width: 25px;
    height: 25px;
    display: inline-block;
  }

  /* Responsive Styles */
  @media (max-width: ${theme.breakpoints.values.sm}px) {
    width: 90% !important;
    padding-top: 46% !important;
    margin: 17px !important;
    min-height: 40px !important;
    min-width: 40px !important;
  }

  /* Animation */
  ${animate ? FadeIn(delay) : ''}
`;

const LogoDiv = styled('div')`
  ${(props) => commonStyles(props)}
`;

const LogoHoverCard = styled(Card)`
  ${(props) => commonStyles(props)}
`;

const getColCount = () => {
  return Math.max(1.0, ~~((window.innerWidth - 132) / 350))
}

const SelectionComponent = ({
  onSelect,
  onVotingSelect,
  selectFirstItem,
  variationGrid,
  variations,
  templateData,
  palette,
  logoStyle,
  regenerateSymbol,
  regenerateLogos,
  showHideSymbol,
  inverted,
  maxItems,
  showLoader,
  animate,
  useFirstTemplate,
  votingMode,
  resetSelection,
  useDividers,
  brandName,
  slogan
}) => {
  const [logoMaker] = useState(new LogoMaker())
  const [_, forceReRender] = useState(false)
  const [amountOfLogos, setAmountOfLogos] = useState(getColCount())
  const [firstRender, setFirstRender] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState(selectFirstItem ? { id: 0 } : null)
  const { analyticsService } = useContext(BootstrapperContext)

  const [skipAnimate, setSkipAnimate] = useState(0)
  const [previousMax, setPreviousMax] = useState(maxItems)

  const [selectedLogoCards, setSelectedLogoCards] = useState([])

  const logoRefsRef = useRef([])

  const selectLogo = useCallback(
    (logoIndex, logoRef) => {
      setSelectedLogo({ id: logoIndex }) // to show overlay

      let logos = votingMode ? [...selectedLogoCards] : []

      if (selectedLogoCards.find((x) => x.id === logoIndex)) {
        selectedLogoCards.forEach((logo) => {
          if (logoIndex === logo.id) {
            logos = selectedLogoCards.filter((logo) => logo.id !== logoIndex)
          }
        })
      } else {
        logos.push({
          id: logoIndex,
          data: logoRef.current ? logoRef.current.dataLogoInstance : {}
        })
      }

      const decorationStyle = logos?.[0]?.data?.logoLayout?.[0]?.settings?.layout?.decoration?.style
      const cardStyle = logos?.[0]?.data?.logoLayout?.[0]?.settings?.layout?.card?.style

      analyticsService?.trackEvent &&
        analyticsService?.trackEvent('logoCardSelected', {
          decorationStyle,
          cardStyle
        })

      setSelectedLogoCards(logos)

      if (votingMode) {
        onVotingSelect(logos)
      } else {
        if (onSelect) {
          onSelect(logoRef, logoIndex)
        }
      }
    },
    [onSelect, onVotingSelect, selectedLogoCards, votingMode]
  )

  useEffect(() => {
    setSkipAnimate(previousMax)
    setPreviousMax(maxItems)
  }, [maxItems, previousMax])

  const getNumberOfLogos = () => {
    let nrOfLogos = 0

    if (maxItems) {
      return maxItems
    }

    if (variationGrid) {
      if (variations) {
        nrOfLogos = variations.length
      }
    } else {
      nrOfLogos = amountOfLogos
    }
    return nrOfLogos
  }

  const updateLogoDivRefs = () => {
    const nrOfLogos = getNumberOfLogos()
    // Create placeholder for the div refs for the logoMaker
    if (nrOfLogos > 0) {
      for (let col = logoRefsRef.current.length; col < nrOfLogos; col++) {
        logoRefsRef.current.push(React.createRef())
      }
    }
  }

  useEffect(() => {
    if (resetSelection) {
      setSelectedLogoCards([])
      setSelectedLogo(null)
    }
  }, [resetSelection])

  useEffect(() => {
    if (selectFirstItem && logoRefsRef.current.length > 0) {
      setSelectedLogo(selectedLogo)
    }
  }, [logoRefsRef.current, selectFirstItem, selectedLogo])

  const showLoadingOverlay = () => {
    const loaderStyle = {
      position: 'absolute',
      left: 'calc(50% - 40px / 2)',
      top: 'calc(50% - 40px / 2)',
      zIndex: 3
    }

    return (
      <React.Fragment>
        <Overlay votingMode={votingMode} />
        {!votingMode && <CircularProgress  sx={loaderStyle} />}
      </React.Fragment>
    )
  }

  const createLogoGrid = () => {
    updateLogoDivRefs()
    const LogoCard = useDividers ? LogoDiv : LogoHoverCard

    const result = []
    const nrOfLogos = getNumberOfLogos()
    for (let i = 0; i < nrOfLogos; i++) {
      const selectedCard = selectedLogoCards.find((card) => card.id === i)
      const isSelectedCard = !!selectedCard // eslint-disabe-line no-extra-boolean-cast
      result.push(
        <React.Fragment key={i}>
          <LogoCard
            className={classNames('logo-preview-wrapper', { variationsBox: variationGrid })}
            animate={animate ? 1 : 0}
            delay={i - skipAnimate}
            selected={isSelectedCard}
            onClick={() => selectLogo(i, logoRefsRef.current[i])}
          >
            {isSelectedCard && showLoader && showLoadingOverlay()}
            <div
              className={classNames('logo-preview', { variationsBox: variationGrid })}
              ref={logoRefsRef.current[i]}
            />
            {isSelectedCard && <CheckBoxIcon />}
          </LogoCard>
          {useDividers && <Divider style={{ width: '100%' }} />}
        </React.Fragment>
      )
    }
    return result
  }
  useEffect(() => {
    for (let i = 0; i < logoRefsRef.current.length; i++) {
      const logoDiv = logoRefsRef.current[i].current
      logoDiv && amcore.removeAllChildren(logoRefsRef.current[i].current)
      if (logoDiv?.dataLogoInstance) {
        logoDiv.dataLogoInstance = null
      }
    }
    forceReRender(!_)
  }, [brandName, slogan, logoStyle, regenerateLogos])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadMore = () => {
    const colCount = getColCount()
    let newCount = amountOfLogos + colCount + 1
    newCount -= newCount % colCount
    if (!maxItems || newCount <= maxItems) {
      setAmountOfLogos(newCount)
    } else {
      setAmountOfLogos(maxItems)
    }
  }

  const setWrapBackground = (wrap, backgroundType) => {
    switch (backgroundType) {
      case 0:
        wrap.current.style.background = 'radial-gradient(ellipse at center,#FFF 0,#FFF 46%, #F8F8F8 100%)'
        break
      // wrap.current.style.background = // 'radial-gradient(ellipse at center,#bbb 0,#aaa 46%, #999 100%)'
      //     'linear-gradient(60deg, #aaa 0%,#a5a5a5 25%,#bcbcbc 45%,#bebebe 50%,#bcbcbc 55%,#a5a5a5 75%,#aaa 100%)'
      // break
      case 1:
        wrap.current.style.background = '#141E30' // radial-gradient(ellipse at center,#444 0,#333 46%, #222 100%)'
        // 'linear-gradient(60deg, #111 0%,#252525 25%,#3c3c3c 45%,#3e3e3e 50%,#3c3c3c 55%,#252525 75%,#111 100%)'
        break
      case 2:
        wrap.current.style.background = '#141E30' // 'radial-gradient(ellipse at center,#444 0,#333 46%, #222 100%)'
        // 'linear-gradient(60deg, #111 0%,#252525 25%,#3c3c3c 45%,#3e3e3e 50%,#3c3c3c 55%,#252525 75%,#111 100%)'
        break
    }
  }

  const generateLogos = useCallback(
    (refs) => {
      if (variationGrid === true) {
        if (logoRefsRef.current.length > 0) {
          variations.map((el, index) => {
            const ref = logoRefsRef.current[index]
            if (ref && ref.current) {
              amcore.removeAllChildren(ref.current)

              ref.current.appendChild(el.instance.element)
              ref.current.dataLogoInstance = el.instance
              el.instance.update()
            }
          })
        }
      } else {
        logoMaker.generate(
          refs.map((e) => e.current),
          { ...templateData },
          false,
          null,
          showHideSymbol ? 'icon' : logoStyle,
          useFirstTemplate
        )
        if (!logoMaker.checkOutOfVariations()) {
          const scrollBottom = window.innerHeight + window.scrollY
          if (scrollBottom >= document.getElementById('content')?.offsetHeight - 10) {
            setTimeout(() => {
              loadMore()
            }, 25)
          }
        }

        if (logoRefsRef.current) {
          for (let i = 0; i < logoRefsRef.current.length; i++) {
            const wrap = logoRefsRef.current[i]
            if (wrap) {
              const logoDiv = logoRefsRef.current[i].current
              if (logoDiv && logoDiv.dataLogoInstance) {
                let backgroundType = wrap.current.dataBackgroundType
                if (inverted) {
                  wrap.current.dataBackgroundType = backgroundType = 1
                } else {
                  if (backgroundType === undefined) {
                    wrap.current.dataBackgroundType = backgroundType = 0 // There is no support for background in the editor so 0 for now
                    // logoDiv.dataLogoInstance.hasSupportColor() || logoDiv.dataLogoInstance.hasDecoration()
                    //   ? 0
                    //   : ~~(Math.random() * 3.0)
                  }
                }
                setWrapBackground(wrap, backgroundType)
                logoDiv.dataLogoInstance.updateBackground(backgroundType > 0)
                logoDiv.dataLogoInstance.update({ text: templateData.text }, false, true)

                if (window.showTheme) {
                  const p = logoDiv.dataLogoInstance.templateData.color.palette
                  const themeDiv = document.createElement('DIV')
                  themeDiv.innerHTML = `<div class="cs"><div class="cb" style="background-color:rgb(${p[0]})"></div><div class="cb" style="background-color:rgb(${p[1]})"></div><div class="cb" style="background-color:rgb(${p[2]})"></div><div class="cb" style="background-color:rgb(${p[3]})"></div></div>`
                  logoDiv.appendChild(themeDiv)
                }
              }
            }
          }
        }
      }
    },
    [
      inverted,
      loadMore,
      logoMaker,
      logoRefsRef.current,
      templateData,
      logoStyle,
      regenerateLogos,
      useFirstTemplate,
      variationGrid,
      variations
    ]
  )

  useEffect(() => {
    generateLogos(logoRefsRef.current)
  }, [generateLogos, logoRefsRef.current])

  useEffect(() => {
    setFirstRender(true)
  }, [])

  useEffect(() => {
    firstRender && logoMaker.handleShowHideSymbol(logoRefsRef.current, showHideSymbol)
  }, [showHideSymbol, regenerateLogos])

  useEffect(() => {
    firstRender && logoMaker.handleRegenerateSymbol(logoRefsRef.current)
  }, [regenerateSymbol])

  useEffect(() => {
    firstRender && logoMaker.handleColorPalette(logoRefsRef.current, palette)
  }, [palette])

  return <Grid className='logo-grid'>{createLogoGrid()}</Grid>
}

SelectionComponent.defaultProps = {
  votingMode: false
}

SelectionComponent.propTypes = {
  animate: PropTypes.bool,
  inverted: PropTypes.bool,
  maxItems: PropTypes.number,
  onSelect: PropTypes.func,
  selectFirstItem: PropTypes.bool,
  showLoader: PropTypes.bool,
  templateData: PropTypes.object,
  useFirstTemplate: PropTypes.object,
  variationGrid: PropTypes.bool,
  variations: PropTypes.array,
  palette: PropTypes.array,
  brandName: PropTypes.string,
  slogan: PropTypes.string,
  logoStyle: PropTypes.string,
  onVotingSelect: PropTypes.func,
  votingMode: PropTypes.bool,
  resetSelection: PropTypes.bool,
  useDividers: PropTypes.bool,
  regenerateLogos: PropTypes.bool,
  showHideSymbol: PropTypes.bool,
  regenerateSymbol: PropTypes.bool
}

export default memo(SelectionComponent)
