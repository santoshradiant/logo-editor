import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'

import Grid from 'core/components/grid'

import 'logomaker/lang'

const votingMode = window.localStorage.getItem('votingMode')

const StyledContainer = styled('div')`
  max-width: 100%;
  position: relative;

  margin: 0 auto;
  margin-bottom: 24px;
  .logo-grid {
    justify-content: space-between;
    overflow-y: inherit;
    @media screen and (max-width: 599px) {
      justify-content: center;
    }
  }

  .logo-preview-wrapper {
    margin: ${({ theme }) => theme.spacing(2.5)} 0 !important;
    width: calc(33% - 25px);
    @media screen and (max-width: 599px) {
      border-radius: ${({ theme }) => theme.spacing(2.5)};
      margin: ${({ theme }) => theme.spacing(1.75)} 0 !important;
      width: 100% !important;
    }
  }
  .svg-hover-area {
    :hover {
      outline: transparent;
    }
  }
`

const PNG_WIDTH = 1200
const PNG_HEIGHT = 800

const Selection = props => {
  const state = props.state
  const rootRef = useRef()
  const [_, forceUpdate] = useState(false)
  const [logoSelected, setLogoSelected] = useState(null)
  const instance = props.instance
  const deselectLogo = () => {
    props.setDisableNext && props.setDisableNext(true)
    setLogoSelected(null)
  }

  const selectTemplateFromRef = (domRef, id) => {
    const selectedInstance = domRef && domRef.current && domRef.current.dataLogoInstance

    if (logoSelected !== id) {
      props.setDisableNext && props.setDisableNext(false)
      setLogoSelected(id)
      instance.update(selectedInstance.templateData)
      selectedInstance.getPngPromise(PNG_WIDTH, PNG_HEIGHT).then(pngData => {
        props.setPreviewImage && props.setPreviewImage(pngData)
      })
    } else {
      deselectLogo()
    }
  }

  useEffect(() => {
    if (state?.regenerateLogosCount && logoSelected) {
      deselectLogo()
    }
  }, [state.regenerateLogosCount])

  useEffect(() => {
    instance.update(state)
    forceUpdate(!_)
  }, [instance, state])

  const variateTemplateFont = {
    text: instance.templateData.text,
    color: instance.templateData.color
  }

  if (!instance.templateData.text.brandName) {
    instance.update({ text: { brandName: 'BRAND NAME' } })
  }

  return (
    <StyledContainer ref={rootRef}>
      <Grid
        selectFirstItem={false}
        templateData={variateTemplateFont}
        onSelect={selectTemplateFromRef}
        brandName={state.brandName}
        regenerateSymbol={state?.regenerateSymbol}
        regenerateLogos={state?.regenerateLogosCount}
        showHideSymbol={state.text.showHideSymbol}
        logoStyle='no-logo'
        slogan={state?.slogan}
        maxItems={9}
        votingMode={votingMode}
        animate
        useDividers={false}
        resetSelection={state?.regenerateLogosCount}
      />
    </StyledContainer>
  )
}

Selection.propTypes = {
  state: PropTypes.object,
  instance: PropTypes.object,
  setPreviewImage: PropTypes.func,
  setDisableNext: PropTypes.func
}

export default Selection
