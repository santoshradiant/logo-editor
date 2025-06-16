import React from 'react'

import Text from '@eig-builder/module-localization'
import '../lang'

import BusinessCard from './images/businesscard.png'
import Instagram from './images/instagram.jpg'
import Totebag from './images/totebag.jpg'
import Tshirt from './images/tshirt.jpg'
import Facebook from './images/facebook_simple.jpg'
import Site from './images/site.jpg'

import Backpack from './images/button.jpg'
import BeerVilt from './images/coaster.jpg'
import Cap from './images/CAP.jpg'
import Display from './images/sign.jpg'
import Mug from './images/MUG.jpg'
import Sticker from './images/STICKER.jpg'

const getTranslation = (segment, type) => <Text message={`logomaker.inspirations.${segment}.${type}`} />

const Inspirations = [
  {
    name: 'site',
    label: getTranslation('site', 'label'),
    backgroundStyling: {
      'background-size': 'contain'
    },
    image: Site,
    render: {
      curve: 0.0,
      translateX: 0.0,
      translateY: 4.4,
      translateZ: 13,
      fieldOfView: 47,
      rotateX: 8,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.7,
      displaceEnd: 1,
      displaceAmount: 0.0,
      highlightStart: 0.0,
      highlightEnd: 2.0,
      highlightAmount: 1.0,
      whiteBalanceR: 1.0,
      whiteBalanceG: 1.0,
      whiteBalanceB: 1.0,
      imageSrc: {}
    }
  },
  {
    name: 'instagram',
    label: getTranslation('instagram', 'label'),
    image: Instagram,
    top: -3.3,
    left: 4.7,
    width: 18,
    height: 18,
    additionalStyling: {
      // borderRadius: '100%',
    },
    background: {
      translateY: -0.2,
      fillPoint: { x: 0.1, y: 0.1 },
      fillColor: [0, 0, 0]
    },
    render: {
      curve: 0.0,
      translateX: -4.46,
      translateY: 1.93,
      translateZ: 13,
      fieldOfView: 33,
      rotateX: 8,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.7,
      displaceEnd: 1,
      displaceAmount: 0.0,
      highlightStart: 0.0,
      highlightEnd: 2.0,
      highlightAmount: 1.0,
      whiteBalanceR: 1.0,
      whiteBalanceG: 1.0,
      whiteBalanceB: 1.0,
      imageSrc: {}
    }
  },
  {
    name: 'facebook',
    label: getTranslation('facebook', 'label'),
    image: Facebook,
    centered: true,
    additionalStyling: {
      // borderRadius: '100%'
    },
    background: {
      translateY: 0.1,
      fillPoint: { x: 0.5, y: 0.5 },
      fillColor: [0, 0, 0]
    },
    render: {
      curve: 0.0,
      translateX: 0,
      translateY: -0.6,
      translateZ: 6.5,
      fieldOfView: 33,
      rotateX: 8,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.7,
      displaceEnd: 1,
      displaceAmount: 0.0,
      highlightStart: 0.0,
      highlightEnd: 2.0,
      highlightAmount: 1.0,
      whiteBalanceR: 1.0,
      whiteBalanceG: 1.0,
      whiteBalanceB: 1.0,
      imageSrc: {}
    }
  },
  {
    name: 'card',
    label: getTranslation('card', 'label'),
    image: BusinessCard,
    background: {
      translateY: -0.2
    },
    render: {
      curve: 0.0,
      translateX: 0,
      translateY: -0.21,
      translateZ: 6.5,
      fieldOfView: 33,
      rotateX: 8,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.7,
      displaceEnd: 1,
      displaceAmount: 0.0,
      highlightStart: 0.0,
      highlightEnd: 2.0,
      highlightAmount: 1.0,
      whiteBalanceR: 1.0,
      whiteBalanceG: 1.0,
      whiteBalanceB: 1.0,
      imageSrc: {}
    }
  },
  {
    name: 'shirt',
    label: getTranslation('shirt', 'label'),
    image: Tshirt,
    render: {
      curve: 0.14,
      translateX: 0,
      translateY: 1.331207995864209,
      translateZ: 14.756160606582803,
      fieldOfView: 33.38841978287093,
      rotateX: 8,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.7,
      displaceEnd: 1,
      displaceAmount: 0.008960882302257453,
      highlightStart: 0.6220920213682578,
      highlightEnd: 1.0015509219369292,
      highlightAmount: 1.006031363088058,
      whiteBalanceR: 0.79,
      whiteBalanceG: 0.79,
      whiteBalanceB: 0.85,
      imageSrc: {}
    },
    animate: {
      param: 'highlightEnd',
      start: 'highlightStart',
      speed: 0.035,
      stopOnDelta: 0.02,
      delay: 20,
      goal: 1.0015509219369292
    }
    // additionalStyling: {
    //   opacity: 0.95
    // }
  },
  {
    name: 'bag',
    label: getTranslation('bag', 'label'),
    image: Totebag,
    render: {
      curve: 0,
      translateX: 0,
      translateY: -0.10253317249698402,
      translateZ: 2.7072204032397043,
      fieldOfView: 50,
      rotateX: -3.691194209891421,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.2801998966052042,
      displaceEnd: 1,
      displaceAmount: 0.4942271239014303,
      highlightStart: 0.4566603480958125,
      highlightEnd: 1.1780113734275375,
      highlightAmount: 1.7670170601413062,
      whiteBalanceR: 0.8,
      whiteBalanceG: 0.8,
      whiteBalanceB: 0.8,
      imageSrc: {}
    },
    animate: {
      param: 'highlightEnd',
      start: 'highlightStart',
      speed: 0.05,
      stopOnDelta: 0.02,
      delay: 40,
      goal: 1.1780113734275375
    }
    // additionalStyling: {
    //   opacity: 0.95
    // }
  },
  {
    name: 'backpack',
    label: getTranslation('backpack', 'label'),
    image: Backpack,
    render: {
      curve: 0,
      translateX: 0.07082543511976613,
      translateY: -0.9217646045149062,
      translateZ: 10.978804066861969,
      fieldOfView: 50,
      rotateX: 0.2791659486472611,
      rotateY: -11.631914526968814,
      rotateZ: 0,
      displaceStart: 0.721351025331725,
      displaceEnd: 0.8757539203860072,
      displaceAmount: 0,
      highlightStart: 0.169912114423574,
      highlightEnd: 0.935378252627951,
      highlightAmount: 1.039117697742547,
      whiteBalanceR: 0.5,
      whiteBalanceG: 0.5,
      whiteBalanceB: 0.55,
      imageSrc: {}
    },
    background: {
      fillPoint: { x: 0.5, y: 0.5 },
      fillColor: [0, 0, 0],
      fillTollerance: 150
    },
    animate: {
      param: 'highlightEnd',
      start: 'highlightStart',
      speed: 0.045,
      stopOnDelta: 0.01,
      delay: 60,
      goal: 0.935378252627951
    }
  },
  {
    name: 'beer',
    label: getTranslation('beer', 'label'),
    image: BeerVilt,
    render: {
      curve: 0,
      translateX: 0,
      translateY: 0.02,
      translateZ: 1.714630363605032,
      fieldOfView: 67.00844390832327,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.5559193520592797,
      displaceEnd: 0.6662071342409098,
      displaceAmount: 0.06,
      highlightStart: 0.325,
      highlightEnd: 0.9,
      highlightAmount: 1,
      whiteBalanceR: 0.6,
      whiteBalanceG: 0.6,
      whiteBalanceB: 0.55,
      imageSrc: {}
    },
    // background: {
    //   fillPoint: { x: 0.5, y: 0.5 },
    //   fillColor: [0, 0, 0],
    //   fillTollerance: 100
    // },
    animate: {
      param: 'highlightEnd',
      start: 'highlightStart',
      speed: 0.04,
      stopOnDelta: 0.07,
      delay: 80,
      goal: 0.9
    }
  },
  {
    name: 'cap',
    label: getTranslation('cap', 'label'),
    image: Cap,
    render: {
      curve: 0.169912114423574,
      translateX: -0.7894192658969499,
      translateY: -2.8597277270377393,
      translateZ: 15.280027571945546,
      fieldOfView: 42.634844046183005,
      rotateX: -35.454075478200934,
      rotateY: 12.190246424263307,
      rotateZ: 0,
      displaceStart: 0.5448905738411166,
      displaceEnd: 0.8978114768223333,
      displaceAmount: 0.05307599517490953,
      highlightStart: 0.4566603480958125,
      highlightEnd: 0.8692055833189729,
      highlightAmount: 0.8736860244701017
    },
    animate: {
      param: 'rotateX',
      start: -180,
      speed: 0.08,
      stopOnDelta: 0.3,
      delay: 100,
      goal: -35.454075478200934
    },
    additionalStyling: {
      // borderRadius: '100%'
      // transform: 'skew(1turn, 2deg)'
    }
  },
  {
    name: 'display',
    label: getTranslation('display', 'label'),
    image: Display,
    render: {
      curve: 0,
      translateX: 1.52,
      translateY: 0.4489057384111659,
      translateZ: 3.5,
      fieldOfView: 67.00844390832327,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.5559193520592797,
      displaceEnd: 0.8978114768223333,
      displaceAmount: 0.031018438738583492,
      highlightStart: 0.36843012235050837,
      highlightEnd: 1.0015509219369292,
      highlightAmount: 1.039117697742547,
      whiteBalanceR: 0.6,
      whiteBalanceG: 0.6,
      whiteBalanceB: 0.7,
      imageSrc: {}
    },
    animate: {
      param: 'highlightEnd',
      start: 'highlightStart',
      speed: 0.025,
      stopOnDelta: 0.01,
      delay: 100,
      goal: 1.0015509219369292
    }
  },
  {
    name: 'mug',
    label: getTranslation('mug', 'label'),
    image: Mug,
    render: {
      curve: 0.6772359124590729,
      translateX: -0.02,
      translateY: -0.21282095467861506,
      translateZ: 57.8,
      fieldOfView: 5.750301568154403,
      rotateX: 12.190246424263307,
      rotateY: 0,
      rotateZ: 0,
      displaceStart: 0.5559193520592797,
      displaceEnd: 0.8978114768223333,
      displaceAmount: 0,
      highlightStart: 0.55,
      highlightEnd: 0.81,
      highlightAmount: 1.1714630363605032,
      whiteBalanceR: 0.85,
      whiteBalanceG: 0.85,
      whiteBalanceB: 0.85,
      imageSrc: {}
    },
    animate: {
      param: 'rotateY',
      start: -180,
      speed: 0.05,
      stopOnDelta: 0.3,
      delay: 150,
      goal: 0
    }
    // additionalStyling: {
    //   opacity: 0.95
    // }
  },
  {
    name: 'sticker',
    label: getTranslation('sticker', 'label'),
    image: Sticker,
    render: {
      curve: 0.18,
      translateX: -0.52,
      translateY: 0.03,
      translateZ: 12.633120799586418,
      fieldOfView: 41,
      rotateX: 0,
      rotateY: 5.2,
      rotateZ: 2.5,
      displaceStart: 0.5559193520592797,
      displaceEnd: 0.8978114768223333,
      displaceAmount: 0,
      highlightStart: 0.14785455798724798,
      highlightEnd: 1.0185466521142599,
      highlightAmount: 1.039117697742547,
      whiteBalanceR: 0.55,
      whiteBalanceG: 0.55,
      whiteBalanceB: 0.6,
      imageSrc: {}
    },
    animate: {
      param: 'highlightEnd',
      start: 'highlightStart',
      speed: 0.005,
      stopOnDelta: 0.3,
      delay: 160,
      goal: 1.0185466521142599
    },
    additionalStyling: {
      // opacity: 0.95
    }
  }
]

export default Inspirations
