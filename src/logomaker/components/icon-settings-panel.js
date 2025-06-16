import React, { memo } from 'react'
import PropTypes from 'prop-types'

import SegmentsPanel from './segments-panel'
import IconSettingsButtons from './icon-settings-buttons'

const IconSettingsPanel = ({ isMobile }) => (
  <>
    <IconSettingsButtons isMobile={isMobile} />
    <SegmentsPanel />
  </>
)
IconSettingsPanel.propTypes = {
  isMobile: PropTypes.bool
}

export default memo(IconSettingsPanel)
