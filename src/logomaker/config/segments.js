import React from 'react'
// Control Components
import NameControls from '../../components/controls/name-controls'
import SloganControls from '../../components/controls/slogan-controls'
import SymbolControls from '../../components/controls/symbol-controls'
import ColorControls from '../../components/controls/color-controls'
import MerchControls from '../../components/controls/merch-controls'
import BackgroundControls from '../../components/controls/background-controls'
import CardTextControls from '../../components/controls/card-text-controls'
import CardBackgroundControls from '../../components/controls/card-background-controls'
import CardFrontControls from '../../components/controls/card-front-controls'
import CardBackControls from '../../components/controls/card-back-controls'
// Icons
import TitleIcon from '@mui/icons-material/Title'
import FormatItalic from '@mui/icons-material/FormatItalic'
import BubbleChart from '@mui/icons-material/BubbleChart'
import FormatColorFill from '@mui/icons-material/FormatColorFill'
import Wallpaper from '@mui/icons-material/Wallpaper'
import TextFields from '@mui/icons-material/TextFields'
import ColorLens from '@mui/icons-material/ColorLens'
import PnP from '@mui/icons-material/PictureInPicture'
import PnPAlt from '@mui/icons-material/PictureInPictureAlt'
import LocalCafe from '@mui/icons-material/LocalCafe'
// Filters
import FontCategoryControl from '../components/filters/font-category-control'

import Text from '@eig-builder/module-localization'
import '../lang'

const getTranslation = (segment, type) => <Text message={`logomaker.segments.${segment}.${type}`} />

const Segments = [
  {
    name: 'name',
    // feature: 'logo-maker',
    label: getTranslation('name', 'label'),
    title: getTranslation('name', 'title'),
    subtitle: getTranslation('name', 'subtitle'),
    icon: TitleIcon,
    control: NameControls,
    variationTarget: 'brand1',
    variationTypes: [
      {
        target: 'brand1',
        type: 'font',
        label: 'Font',
        variationFilter: FontCategoryControl
      }
    ]
  },
  {
    name: 'slogan',
    // feature: 'logo-maker',
    label: getTranslation('slogan', 'label'),
    title: getTranslation('slogan', 'title'),
    subtitle: getTranslation('slogan', 'subtitle'),
    icon: FormatItalic,
    control: SloganControls,
    variationTarget: 'slogan',
    variationTypes: [
      {
        target: 'slogan',
        type: 'font',
        label: 'Font',
        variationFilter: FontCategoryControl
      },
      {
        target: 'slogan',
        label: 'Layout'
      }
    ]
  },
  {
    name: 'symbol',
    // feature: 'logo-maker',
    label: getTranslation('symbol', 'label'),
    title: getTranslation('symbol', 'title'),
    subtitle: getTranslation('symbol', 'subtitle'),
    icon: BubbleChart,
    control: SymbolControls,
    variationTarget: 'symbol',
    variationTypes: [
      {
        target: 'symbol',
        label: 'Symbol'
      },
      {
        target: 'slogan',
        type: 'font',
        label: 'Initials',
        variationFilter: FontCategoryControl
      }
    ]
  },
  {
    name: 'color',
    // feature: 'logo-maker',
    label: getTranslation('color', 'label'),
    title: getTranslation('color', 'title'),
    subtitle: getTranslation('color', 'subtitle'),
    icon: FormatColorFill,
    control: ColorControls,
    variationTarget: 'color',
    variationTypes: [
      {
        target: 'color',
        label: 'Color'
      }
    ]
  },
  {
    name: 'backgrounds',
    // feature: 'logo-maker',
    smallButtonFont: true,
    label: getTranslation('shape', 'label'),
    title: getTranslation('shape', 'title'),
    subtitle: getTranslation('shape', 'subtitle'),
    icon: Wallpaper,
    control: BackgroundControls,
    variationTarget: 'decoration',
    variationTypes: [
      {
        target: 'decoration',
        label: 'Decoration'
      }
    ]
  },
  {
    name: 'merch',
    label: getTranslation('merch', 'label'),
    title: getTranslation('merch', 'title'),
    subtitle: getTranslation('merch', 'subtitle'),
    icon: LocalCafe,
    control: MerchControls,
    variationTarget: 'merch',
    variationTypes: []
  },
  {
    name: 'card-text',
    // feature: 'business-cards',
    smallButtonFont: true,
    showAsCard: true,
    label: getTranslation('cardText', 'label'),
    title: getTranslation('cardText', 'title'),
    subtitle: getTranslation('cardText', 'subtitle'),
    icon: TextFields,
    control: CardTextControls,
    variationTarget: 'card',
    variationTypes: [
      {
        target: 'card',
        label: 'Layout'
      }
    ]
  },
  {
    name: 'card-background',
    // feature: 'business-cards',
    smallButtonFont: true,
    showAsCard: true,
    label: getTranslation('cardBackground', 'label'),
    title: getTranslation('cardBackground', 'title'),
    subtitle: getTranslation('cardBackground', 'subtitle'),
    icon: ColorLens,
    control: CardBackgroundControls,
    variationTarget: 'card',
    variationTypes: [
      {
        target: 'card',
        label: 'Layout'
      }
    ]
  },
  {
    name: 'card-front',
    // feature: 'business-cards',
    smallButtonFont: true,
    showAsCard: true,
    label: getTranslation('cardFront', 'label'),
    title: getTranslation('cardFront', 'title'),
    subtitle: getTranslation('cardFront', 'subtitle'),
    icon: PnP,
    control: CardFrontControls,
    variationTarget: 'card-font',
    variationTypes: [
      {
        target: 'card',
        label: 'Layout'
      }
    ]
  },
  {
    name: 'card-back',
    // feature: 'business-cards',
    smallButtonFont: true,
    showAsCard: true,
    label: getTranslation('cardBack', 'label'),
    title: getTranslation('cardBack', 'title'),
    subtitle: getTranslation('cardBack', 'subtitle'),
    icon: PnPAlt,
    control: CardBackControls,
    variationTarget: 'card-back',
    variationTypes: [
      {
        target: 'card',
        label: 'Layout'
      }
    ]
  }
]

let segments
if (window.location.pathname.indexOf('card-') !== -1) {
  segments = Segments.filter(({ name }) => name.startsWith('card-'))
} else {
  segments = Segments.filter(({ name }) => !name.startsWith('card-'))
}

export default segments
