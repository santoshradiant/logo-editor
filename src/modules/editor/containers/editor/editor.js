import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import  { Navigation, PageContent } from '@eig-builder/module-navigation'
import { Loader } from '@eig-builder/compositions-loader-with-timeout'

import EditingContent, { FlexFlowCard } from '../../components/editing-content'
import { LogoMaker } from 'logomaker'
import { useEditorContext } from 'logomaker/context/editor-context'
import { useIsPortrait, useMediaQuery } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

const Editor = ({ loadingFulfilled, onScrollContent, scrolled, inverted }) => {
  const { logoInstance, unSavedProgress, activeSegment } = useEditorContext()
  const isPortrait = useIsPortrait()
  const mobileBreakpoint = useMediaQuery({ query: '(max-height: 450px) and (max-width: 900px)' })
  const imNotInLandscapeMode = !isPortrait && mobileBreakpoint
  const isMerchTab = activeSegment === 'merch'
  useEffect(() => {
    window.onbeforeunload = function () {
      if (unSavedProgress) {
        return 'Unsaved changes will be lost if you leave the page, are you sure?'
      }
    }
    return () => {
      window.onbeforeunload = function () {}
    }
  }, [unSavedProgress])

  return (
    <PageContent amountOfDetailBars={1}>
      {loadingFulfilled ? (
        <FlexFlowCard>
          {!imNotInLandscapeMode && (
            <Navigation.LeftContentDrawer>
              <LogoMaker.IconSettingsPanel />
            </Navigation.LeftContentDrawer>
          )}
          <EditingContent onScroll={onScrollContent}>
            {isMerchTab ? (
              <LogoMaker.MerchPreview scrolled={scrolled} inverted={inverted} />
            ) : (
              <LogoMaker.LogoArea scrolled={scrolled} inverted={inverted} logoInstance={logoInstance} />
            )}
          </EditingContent>
          {!imNotInLandscapeMode && !isMerchTab && <LogoMaker.VariationsArea inverted={inverted} />}
        </FlexFlowCard>
      ) : (
        <Loader centeredX centeredY timeOutMs={1500} />
      )}
    </PageContent>
  )
}
Editor.propTypes = {
  inverted: PropTypes.bool,
  loadingFulfilled: PropTypes.bool,
  onScrollContent: PropTypes.func.isRequired,
  scrolled: PropTypes.bool
}

export default React.memo(Editor)
