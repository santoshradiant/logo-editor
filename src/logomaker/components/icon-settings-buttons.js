import React from 'react'
import PropTypes from 'prop-types'

import useFeature from '@eig-builder/core-utils/hooks/useFeature'
import IconSettingsMenu from '../../components/icon-settings-menu'
import { useEditorContext } from '../context/editor-context'

export default function IconSettingsButtons ({ isMobile }) {
  const { segments, activeSegment, setActiveSegment } = useEditorContext()
  const hasBusinessCardFeature = useFeature('2020BUSINESSCARD')

  return (
    <IconSettingsMenu
      items={segments.filter(x => {
        let allowed = true
        if (x.feature && !hasBusinessCardFeature) {
          allowed = false
        }
        return allowed
      })}
      activeName={activeSegment}
      isMobile={isMobile}
      setActive={setActiveSegment}
    />
  )
}
IconSettingsButtons.propTypes = {
  isMobile: PropTypes.bool
}
