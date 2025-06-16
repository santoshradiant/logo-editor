import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { styled } from '@mui/material/styles'

import { PageContent } from '@eig-builder/module-navigation'
import Grid from '@mui/material/Grid2'
import Tabs from '@eig-builder/compositions-responsive-tabs'

import EditingContent from '../../components/editing-content'
import { LogoMaker } from '../../../../logomaker'
import { useEditorContext } from '../../../../logomaker/context/editor-context'
import { DataElementLocations, DataElementTypes } from '@eig-builder/core-utils/helpers/tagging-helper'

const SettingsContainer = styled('div')`
  width: 100%;
  overflow-x: hidden;

  body {
    overscroll-behavior-y: contain;
  }
`
const getScrollHeight = logoAreaRef => {
  const navBarHeight = 64
  const controlsBarHeight = 80
  const logoAreaHeight = logoAreaRef.current ? logoAreaRef.current.clientHeight : 0

  return window.innerHeight - (navBarHeight + controlsBarHeight + logoAreaHeight) - window.scrollY
}

const ControlsScrollDiv = styled('div')`
  width: 100%;
  height: ${props => getScrollHeight(props.scrollRef) + 'px'};
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`
const RelativeTabBox = styled('div')`
  background: white;
  height: 50px;
  width: 100%;
  background: white;
 
`
const defaultTabs = [
  {
    label: 'Settings',
    key: 0
  },
  {
    label: 'Variations',
    key: 1
  }
]

const Editor = ({ onScrollContent, scrolled, inverted }) => {
  const logoAreaRef = useRef()
  const panelDivRef = useRef()
  const [InSettingsNotVariations, setTab] = useState(true)
  const { activeSegment, logoInstance } = useEditorContext()
  const [tabOptions, setTabOptions] = useState(defaultTabs)
  const isMerchTab = activeSegment === 'merch'


  // scroll to top on every switch tab render.
  useEffect(() => {
    if (panelDivRef.current) {
      panelDivRef.current.scrollTop = 0
    }
    if (activeSegment === 'merch') {
      setTab(true)
      const temp = tabOptions.filter(item => item.label !== 'Variations')
      setTabOptions(temp)
    } else {
      setTabOptions(defaultTabs)
    }
  }, [activeSegment])

  return (
    <PageContent>
      <div ref={logoAreaRef}>
        <EditingContent onScroll={onScrollContent}>
          {isMerchTab ? (
            <LogoMaker.MerchPreview scrolled={scrolled} inverted={inverted} />
          ) : (
            <LogoMaker.LogoArea scrolled={scrolled} inverted={inverted} logoInstance={logoInstance} />
          )}
        </EditingContent>
      </div>
        <SettingsContainer>
          <Grid container>
            <LogoMaker.IconSettingsButtons isMobile />
          </Grid>
        </SettingsContainer>
        <ControlsScrollDiv scrollRef={logoAreaRef} ref={panelDivRef}>
          <RelativeTabBox>
            <Tabs
              tabs={tabOptions}
              fullWidth
              mobileRes=''
              value={!InSettingsNotVariations ? 1 : 0}
              handleChange={index => setTab(index === 0)}
              dataElementType={DataElementTypes.TAB}
              dataElementLocation={DataElementLocations.RIGHT_RAIL}
              dataElementId='logomaker.variations-area.tabs'
              dataElementIdPrefix='logomaker.variations-area'
              dataElementLabel='logomaker-variations-area-tabs'
              dataElementLabelPrefix='logomaker-variations-area-tabs'
            />
          </RelativeTabBox>

          { InSettingsNotVariations ? (
            <LogoMaker.SegmentsPanel />
          ) : (
            <LogoMaker.VariationsArea inverted={inverted} />
          )}
        </ControlsScrollDiv>
    </PageContent>
  )
}
Editor.propTypes = {
  inverted: PropTypes.bool,
  onScrollContent: PropTypes.func.isRequired,
  scrolled: PropTypes.bool
}

export default Editor
