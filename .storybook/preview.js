import { addDecorator } from '@storybook/react'
import React from 'react'
import { withA11y } from '@storybook/addon-a11y'

import { AllTheProviders } from '../test/test-wrapper'

addDecorator(storyFn => <AllTheProviders>{storyFn()}</AllTheProviders>)
addDecorator(withA11y)

if (window.location.hostname !== 'localhost') {
  __webpack_public_path__ = 'https://storybook.builderservices.io/app-logomaker/'
}
