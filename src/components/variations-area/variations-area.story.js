import React, { useState } from 'react'
import VariationsArea from './variations-area'
import EditorContext from 'logomaker/context/editor-context'
import TitleIcon from '@mui/icons-material/Title'
import NameControls from '../controls/name-controls'
import FontCategoryControl from 'logomaker/components/filters/font-category-control'
import FormatItalic from '@mui/icons-material/FormatItalic'
import SloganControls from '../controls/slogan-controls'
import BubbleChart from '@mui/icons-material/BubbleChart'
import SymbolControls from '../controls/symbol-controls'
import FormatColorFill from '@mui/icons-material/FormatColorFill'
import ColorControls from '../controls/color-controls'
import Wallpaper from '@mui/icons-material/Wallpaper'
import BackgroundControls from '../controls/background-controls'
import TextFields from '@mui/icons-material/TextFields'
import CardTextControls from '../controls/card-text-controls'
import ColorLens from '@mui/icons-material/ColorLens'
import CardBackgroundControls from '../controls/card-background-controls'
import PnP from '@mui/icons-material/PictureInPicture'
import CardFrontControls from '../controls/card-front-controls'
import PnPAlt from '@mui/icons-material/PictureInPictureAlt'
import CardBackControls from '../controls/card-back-controls'
import Text from '@eig-builder/module-localization'
import LogoMaker from 'core/logo-maker/logo-maker'
// Required styling
import { styled } from '@mui/material/styles'
import Breakpoints from '@eig-builder/core-utils/hooks/useResponsiveQuery'

const StoryContainer = styled('div')`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;

  @media screen and (max-width: ${Breakpoints.TABLET}px) {
    left: 0;
  }

  > * {
    height: 100%;
  }
`

const getTranslation = (segment, type) => <Text message={`logomaker.segments.${segment}.${type}`} />

export const Default = () => {
  const [segments] = useState([
    {
      name: 'name',
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
      name: 'card-text',
      feature: 'business-cards',
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
      feature: 'business-cards',
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
      feature: 'business-cards',
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
      feature: 'business-cards',
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
  ])
  const activeSegment = segments[0].name
  const [editorTemplate, setEditorTemplate] = React.useState({
    text: {
      brandName: 'Test',
      slogan: 'Test Slogan',
      original: {
        brandName: 'BRAND NAME',
        slogan: ''
      },
      stopRandomize: true
    },
    color: {
      brand1: 1,
      decoration: 2,
      palette: [
        [255, 255, 255],
        [0, 0, 0],
        [43, 47, 50],
        [96, 125, 139]
      ],
      paletteDark: ['#000000', '#FFFFFF', '#292826', '#f9d342'],
      slogan: 2
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
        id: 'gf_Libre Baskerville_700',
        letterSpacing: 1,
        lineSpacing: 1,
        size: 1,
        category: 'typesetting',
        duoColorPosition: 1,
        letterSpacingMethod: 'font'
      },
      slogan: {
        id: 'gf_Roboto Condensed_700',
        category: 'modern',
        size: 1,
        lineSpacing: 1,
        letterSpacing: 1,
        letterSpacingMethod: 'font'
      },
      card: {
        id: 'gf_Nunito_400',
        category: 'modern',
        size: 1,
        lineSpacing: 1,
        letterSpacing: 1,
        letterSpacingMethod: 'font'
      },
      cardTitle: {
        id: 'gf_Libre Baskerville_700',
        category: 'typesetting',
        size: 1,
        lineSpacing: 1,
        letterSpacing: 1,
        letterSpacingMethod: 'font'
      },
      singleFont: true
    },
    layout: {
      brand: {
        alignment: 'horizontal'
      },
      decoration: {
        style: 'hexagon'
      },
      slogan: {
        style: 'center'
      },
      symbol: {
        position: 'none',
        decoration: 'none'
      },
      card: {
        justify: 'center',
        style: 'card1',
        showSymbol: false,
        orientation: 'landscape',
        colorMode: 'black'
      }
    },
    logoVersion: 3,
    background: {
      strokeDistance: 0.75,
      borderRadius: 0.8066361041623165,
      inverse: false,
      borderStyle: 'single',
      strokeWidth: 0.5055672838153132
    }
  })
  const customVariationTrigger = 0
  const [logoMaker] = useState(new LogoMaker({ initialWidth: 560, initialHeight: 410 }))

  const setTemplateActive = newTemplate => {
    if (newTemplate !== null) {
      setEditorTemplate(newTemplate)
    }
  }

  return (
    <StoryContainer>
      <EditorContext.Provider
        value={{ segments, activeSegment, editorTemplate, customVariationTrigger, logoMaker, setTemplateActive }}
      >
        <VariationsArea />
      </EditorContext.Provider>
    </StoryContainer>
  )
}

export default {
  title: 'VariationsArea',
  component: VariationsArea
}
