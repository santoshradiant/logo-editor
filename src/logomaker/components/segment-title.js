import React, { useContext } from 'react'
import LogoMakerContext from '../context/editor-context'
import PageHeader from '@eig-builder/compositions-page-header'
import Text from '@eig-builder/module-localization'
import '../lang'

const SegmentControls = () => {
  let title = <Text message='logomaker.segments.noSelected.title' />
  let subTitle = <Text message='logomaker.segments.noSelected.subtitle' />

  const logoMakerContext = useContext(LogoMakerContext)
  const { segments, activeSegment } = logoMakerContext
  const currentActiveSegment = segments.find(s => s.name === activeSegment)
  if (currentActiveSegment) {
    title = currentActiveSegment.title
    subTitle = currentActiveSegment.subTitle
  }
  return <PageHeader title={title} subtitle={subTitle} />
}

export default SegmentControls
