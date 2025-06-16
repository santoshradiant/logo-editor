import React, { useCallback, useEffect, useRef } from 'react'
import debounce from 'lodash/debounce'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import { styled } from '@mui/material/styles'
import Divider from '@mui/material/Divider'

import LogoCharacteristics from 'logomaker/components/logo-characteristics'
import Breakpoints, { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery'
import useEventListener from 'hooks/useEventListener'

const OptionsCard = styled('div')`
  position: absolute;
  right: -55px;
  display: block;
  width: 50px;
  overflow: hidden;
  top: 0;
`

const PreviewCard = styled('div')`
  padding-top: 56%;
  position: relative;
  width: 100%;
  margin-bottom: 20px;
`

const LogoWrapper = styled('div')`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    padding: 8px;
  }
`

const OverflowCard = styled(Card)`
  overflow: visible !important;
  width: 100%;
  padding-top: 72%;
  max-height: calc(100% - 240px);
  position: relative;
  perspective: 2000px;
`

const OverflowCardDiv = styled('div')`
  overflow: visible !important;
  width: 100%;
  padding-top: 72%;
  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    /* padding-top: 58%;*/
    padding-top: 70%;
  }
  position: relative;
`

const SizedCardContent = styled(CardContent)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border: 1px solid #fff;

  border-radius: 4px;
  background: ${props =>
    props['data-invertedlogo']
      ? '#141E30'
      : 'radial-gradient(at center center, rgb(255, 255, 255) 0px, rgb(255, 255, 255) 46%, rgb(248, 248, 248) 100%)'};
`

const SizedCardContentDiv = styled('div')`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  padding: 0px;
  overflow: hidden;
  /* background: ${props =>
    props['data-invertedlogo']
      ? '#141E30'
      : 'radial-gradient(at center center, rgb(255, 255, 255) 0px, rgb(255, 255, 255) 46%, rgb(248, 248, 248) 100%)'}; */
  /* box-shadow: initial !important; */
`
const FullWidthLogo = styled('div')`
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const LogoArea = ({ preview, options, scrolled, logoInstance }) => {
  const isMobile = useIsMobile()
  const domRef = useRef()

  useEffect(() => {
    if (logoInstance) {
      logoInstance.update()
      domRef.current.appendChild(logoInstance.getPreviewElement())
    }
  }, [logoInstance])

  const handleResize = useCallback(() => {
    if (logoInstance) {
      debounce(() => logoInstance.update(), 300)
    }
  }, [logoInstance])

  useEventListener('resize', handleResize)

  const LogoCard = isMobile ? OverflowCardDiv : OverflowCard
  const CardContent = isMobile ? SizedCardContentDiv : SizedCardContent

  // TODO ANDRE: GET INVERT STATE FROM LOGOINSTANCE AND UPDATE LIGHT PROPERTY
  const classes = classNames('logo-editor-preview', {
    'big-card': preview,
    scrolled: scrolled
  })

  return (
    <div className={classes}>
      {preview ? (
        <React.Fragment>
          <PreviewCard>
            <LogoWrapper inverted={logoInstance && logoInstance.darkTheme} preview={preview} className='logoCard'>
              <FullWidthLogo key='logo' ref={domRef} />
            </LogoWrapper>
          </PreviewCard>
          <Divider />
          <LogoCharacteristics editorTemplate={logoInstance.templateData} />
        </React.Fragment>
      ) : (
        <LogoCard>
          <CardContent
            data-invertedlogo={logoInstance && logoInstance.darkTheme}
            preview={preview}
            className='logoCard'
          >
            <FullWidthLogo key='logo' ref={domRef} />
          </CardContent>
          <OptionsCard>{options}</OptionsCard>
        </LogoCard>
      )}
    </div>
  )
}

LogoArea.propTypes = {
  options: PropTypes.node,
  scrolled: PropTypes.bool,
  preview: PropTypes.bool,
  logoInstance: PropTypes.object
}

export default LogoArea
