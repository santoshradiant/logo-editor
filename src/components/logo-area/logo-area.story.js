import LogoArea from './logo-area'
import React from 'react'
import LogoInstance from 'core/logo-maker/logo-instance'

const logoInstance = new LogoInstance({
  text: {
    brandName: 'Badass brand',
    slogan: 'Awesome slogan'
  },
  color: {
    brand1: 1,
    brand2: 1,
    decoration: 2,
    palette: ['#FFFFFF', '#000000', '#292826', '#f9d342'],
    paletteDark: ['#000000', '#FFFFFF', '#292826', '#f9d342'],
    slogan: 1,
    symbol: 1
  },
  brand1: {
    letterSpacing: 1,
    lineSpacing: 1
  },
  brand2: {
    letterSpacing: 1,
    lineSpacing: 1
  },
  font: {
    brand1: {
      id: 'gf_Abril Fatface_400',
      letterSpacing: 1,
      lineSpacing: 1,
      size: 1
    },
    brand2: {
      id: 'gf_Abril Fatface_400',
      letterSpacing: 1,
      lineSpacing: 1,
      size: 1
    },
    slogan: {
      id: 'gf_Abril Fatface_400',
      letterSpacing: 1,
      lineSpacing: 1,
      size: 1
    },
    decoration: {
      id: 'poppinslight',
      slogan: {
        id: 'poppinslight',
        size: 1,
        lineSpacing: 1,
        letterSpacing: 1
      }
    }
  },
  layout: {
    brand: { alignment: 'vertical' },
    decoration: { style: 'none' },
    slogan: { style: 'center' },
    symbol: {
      position: 'none',
      decoration: 'none'
    }
  },
  symbol: {
    icon: {
      fontId: 'df_HelveticaNeueLTStd-Blk.otf',
      id: 'T',
      initials: 'T',
      spacing: 1,
      type: 'initials'
    },
    size: 1,
    spacing: 1
  }
})

export const Default = () => (
  <div style={{ width: 500, margin: '1em auto' }}>
    <LogoArea logoInstance={logoInstance} preview={false} scrolled={false} />
  </div>
)

export default {
  title: 'LogoArea',
  component: LogoArea
}
