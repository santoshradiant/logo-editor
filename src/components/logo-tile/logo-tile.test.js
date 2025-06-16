import 'jest-styled-components'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React from 'react'
import { axe } from 'jest-axe'
import { render } from 'test-wrapper'

import Mocklogos from './__mock__/logos.json'
import LogoTileContainer from './logo-tile-container'
import LogoTile from './logo-tile'

describe('LogoTile', () => {
  test('Accessibility', async () => {
    const logo = Mocklogos[0]
    const selectLogo = jest.fn()
    const downloadLogo = jest.fn()
    const deleteLogo = jest.fn()
    const goEditLogo = jest.fn()
    const goDownloadLogo = jest.fn()
    const goPreviewLogo = jest.fn()
    const getNextLogo = jest.fn()
    const animateLogoBeforeNavigate = jest.fn()

    const { container } = await render(
      <div style={{ height: 500 }}>
        <LogoTileContainer key={logo.id}>
          <LogoTile
            logo={logo}
            makeLogoSelected={selectLogo}
            downloadLogo={downloadLogo}
            deleteLogo={deleteLogo}
            goEditLogo={goEditLogo}
            goDownloadLogo={goDownloadLogo}
            goPreviewLogo={goPreviewLogo}
            getNextLogo={getNextLogo}
            // set animation off for now
            animateLogoBeforeNavigate={animateLogoBeforeNavigate}
          />
        </LogoTileContainer>
      </div>
    )

    // Compare snapshot
    expect(container).toMatchSnapshot()

    // Check accessibility
    const result = await axe(container)
    expect(result).toHaveNoViolations()
  })
})
