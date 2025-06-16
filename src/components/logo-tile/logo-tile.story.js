import React from 'react'
import Mocklogos from './__mock__/logos.json'
import LogoTileContainer from './logo-tile-container'
import LogoTile from './logo-tile'

export const Default = x => {
  const logo = Mocklogos[0]
  const selectLogo = () => {}
  const downloadLogo = () => {}
  const deleteLogo = () => {}
  const goEditLogo = () => {}
  const goDownloadLogo = () => {}
  const goPreviewLogo = () => {}
  const getNextLogo = () => {}
  const animateLogoBeforeNavigate = () => {}

  return (
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
}

export default {
  title: 'LogoTile',
  component: LogoTile
}
