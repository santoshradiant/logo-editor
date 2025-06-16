import React from 'react'
import IconSettingsMenu from './icon-settings-menu'
import MockSettings from './__mock__/index'

export const Default = () => (
  <div style={{ height: 500 }}>
    <IconSettingsMenu items={MockSettings} activeName={MockSettings[1].name} setActive={() => {}} />
  </div>
)

export default {
  title: 'IconSettingsMenu',
  component: IconSettingsMenu
}
