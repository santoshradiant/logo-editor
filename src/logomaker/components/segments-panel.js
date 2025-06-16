import React, { memo } from 'react'

import { styled } from '@mui/material/styles'
import PageHeader from '@eig-builder/compositions-page-header'
import { useEditorContext } from '../context/editor-context'
import Breakpoints, { useMediaQuery } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

const Panel = styled('div')`

  overflow-y: auto;
  height: 100%;
  width: ${({ isMobile }) => (isMobile ? '100%' : 'calc(100% - 92px);')};;

  padding: 24px;
  float: right;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.palette.white.main};
`

const SegmentsPanel = () => {
  const { segments, activeSegment } = useEditorContext()
  const isMobile  = useMediaQuery({ query: `(max-width: ${Breakpoints.LARGE_DESKTOP}px)` })


  return segments.map((segment) => {
    const { name, label, control: Component } = segment
    const active = name === activeSegment
    return active ? (
      <Panel key={name} isMobile={isMobile}>
        {/* on Mobile we don't want to show the title */}
        {!isMobile && <PageHeader title={label} />}
        <div key={name}>
          <Component />
        </div>
      </Panel>
    ) : null
  })
}

export default memo(SegmentsPanel)
