import PropTypes from 'prop-types'
import React from 'react'
import IconSettingsMenuItem from './icon-settings-menu-item'
import { IconContainer, FullHeightWrapper } from './icon-settings-menu.view'

export default function IconSettingsMenu ({ isMobile, items, activeName, setActive }) {
  return (
    <FullHeightWrapper isMobile={isMobile}>
      <IconContainer role='tablist'  isMobile={isMobile}>
        {items.map((item, index) => (
          <IconSettingsMenuItem {...item} index={index} key={item.name} active={activeName} onActivate={setActive} />
        ))}
      </IconContainer>
    </FullHeightWrapper>
  )
}

IconSettingsMenu.propTypes = {
  activeName: PropTypes.string,
  isMobile: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.any,
      icon: PropTypes.object,
      smallButtonFont: PropTypes.bool
    })
  ),
  setActive: PropTypes.func
}
