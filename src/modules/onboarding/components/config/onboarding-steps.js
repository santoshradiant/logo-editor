import React from 'react'
import Text from '@eig-builder/module-localization'
import '../../containers/lang'

import Create from '../create'
import Preview from '../preview'

import Selection from '../selection'

export default [
  {
    title: <Text message='modules.onboarding.steps.create.header' />,
    subtitle: <Text message='modules.onboarding.steps.create.subtitle' />,
    sidebar: Create,
    content: Selection,
    name: 'Create'
  },
  {
    title: <Text message='modules.onboarding.steps.variations.header' />,
    subtitle: <Text message='modules.onboarding.steps.variations.subtitle' />,
    sidebar: Preview,
    content: Selection,
    name: 'Preview'
  },
  {
    title: <Text message='modules.onboarding.steps.preview.header' />,
    subtitle: <Text message='modules.onboarding.steps.preview.header' />,
    sidebar: () => 'compA',
    content: () => 'component with content'
  }
]
