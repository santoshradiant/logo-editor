import PropTypes from 'prop-types'
import React from 'react'
import { StyledGrid, Label, IconBarButton } from './icon-settings-menu.view'

const IconSettingsMenuItem = ({ isMobile, name, label, icon: Icon, active, onActivate, index, smallButtonFont }) => {
  const onClickHandler = () => onActivate(name)
  return (
    <IconBarButton
      role='tab'
      aria-selected={name === active}
      active={name === active}
      onClick={onClickHandler}
      isMobile={isMobile}
      smallFontSize={smallButtonFont}
      index={index}
    >
      <StyledGrid container direction='column' sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Icon />
        <Label data-testid='label'>{label}</Label>
      </StyledGrid>
    </IconBarButton>
  )
}

IconSettingsMenuItem.propTypes = {
  active: PropTypes.string,
  icon: PropTypes.any,
  index: PropTypes.any,
  label: PropTypes.any,
  name: PropTypes.any,
  onActivate: PropTypes.func,
  smallButtonFont: PropTypes.any
}
export default React.memo(IconSettingsMenuItem)
