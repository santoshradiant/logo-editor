import React, { useState, memo, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
// import LogoMakerContext,  } from 'logomaker/context/editor-context'
// import Text from '@eig-builder/module-localization'
import LogoInstance from 'core/logo-maker/logo-instance'
import Card from '@mui/material/Card'

// import PageHeader from '@eig-builder/compositions-page-header'
import get from 'lodash/get'
import { styled } from '@mui/material/styles'
import FontResources from 'core/logo-maker/resources/font-resources'
import useInterval from 'hooks/useInterval'
import { DataElementLocations, DataElementTypes, getDataProperty } from '@eig-builder/core-utils/helpers/tagging-helper'

import Button from '@mui/material/Button'
// import md5 from 'md5'

// import Mobile, { isDeviceTablet } from '@eig-builder/core-utils/helpers/mobile-detection-helper'
import LogoMaker from 'core/logo-maker/logo-maker'

const INCREASE_AMOUNT = 8

// mobile version if mobile or orientation is vertical on tablet
// const MD = () => Mobile() || (isDeviceTablet() && window.orientation === 0)

const HoverCard = styled(Card)`
  :hover {
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.22), 0 2px 4px 0 rgba(0, 0, 0, 0.21), 0 2px 1px 0 rgba(0, 0, 0, 0.19);
  }
`
const VariationAreaBox = styled('div')`
  height: 100%;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`
const VariationGrid = styled('div')`
  display: flex;
`

const CenterButtonWrapper = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  button {
    width: calc(33.33% - 32px);
  }
`

// const RelativeTabBox = styled('div')`
//   position: relative;
//   width: 100%;
//   margin-top: 30px;
//   justify-content: center;
//   display: flex;
//   margin-bottom: 12px;

//   /* Hack for the tabs component */
//   .container {
//     display: contents;
//   }
// `

const VariationArea = ({
  inverted,
  variationTarget,
  variationTypes,
  editorTemplate,
  target,
  type,
  setTemplateActive
}) => {
  // const context = useContext(LogoMakerContext)
  // const [currentTab, setCurrentTab] = useState(0)
  const [showAmount, setShowAmount] = useState(10)
  const [variations, setVariations] = useState([])
  const [variationStack, updateVariationStack] = useState(0)

  const [logoMaker] = useState(new LogoMaker())

  // const [variationFilter, setVariationFilter] = useState(null)
  const variationFilter = variationTypes.variationFilter
  const containerScrollRef = useRef(null)
  // const { segments, activeSegment, editorTemplate, customVariationTrigger } = context
  // const foundSegment = segments.find(s => s.name === activeSegment)
  // const { variationTarget, variationTypes } = foundSegment || {}

  // useEffect(() => {
  //   setCurrentTab(0)
  // }, [activeSegment])

  // const { target, type = 'layout', variationFilter: VariationFilter } = variationTypes[currentTab || 0] || {}

  const _getFontCategory = (editorTemplate, variationTarget) => {
    const FontResource = FontResources.getInstance()
    const currentFont = get(editorTemplate, `font.${variationTarget}.id`)
    const fontCategory = FontResource.getCategoryForFont(currentFont) || 'decorative'
    return fontCategory
  }

  const filter = _getFontCategory(editorTemplate, target)

  useEffect(() => {
    updateVariationStack(new Date().getTime())
    // console.log(variationStack)
  }, [editorTemplate, variationFilter]) // eslint-disable-line

  const generateVariations = useCallback(() => {
    const { generateFontPreviewStyles, generateVariations } = logoMaker
    let variations = null
    if (generateFontPreviewStyles && generateVariations) {
      if (type === 'font') {
        variations = logoMaker.generateFontPreviewStyles(editorTemplate, filter, variationTarget)
      } else {
        variations = logoMaker.generateVariations(editorTemplate, variationTarget)
      }
    }
    // return uniqBy(variations, (x) => md5(JSON.stringify(x)))
    return variations
  }, [editorTemplate, filter, logoMaker, type, variationTarget])

  useEffect(() => {
    setShowAmount(9)
    setVariations(generateVariations())
    updateVariationStack(0)
  }, [variationFilter]) // eslint-disable-line

  if (!variationTarget || !variationTypes) {
    throw Error('There is no variation target or variationTypes specified')
  }

  useInterval(() => {
    if (variationStack > 0) {
      if (new Date().getTime() - variationStack < 200000) {
        updateVariationStack(variationStack - variationStack / 4)
      } else {
        // setVariations(generateVariations())
        updateVariationStack(0)
      }
    }
  }, 500)

  // Generate the tabs
  // const tabs = variationTypes.map((vT, index) => ({
  //   label: vT.label,
  //   key: index
  // }))

  return (
    <VariationAreaBox>
      <VariationGrid ref={containerScrollRef}>
        <div
          className='logo-grid'
          style={{
            overflow: 'auto',
            height: '100%',
            width: '100%'
          }}
        >
          {variations && variations.length ? (
            <>
              {variations.slice(0, showAmount).map((variation, index) => {
                const merged = logoMaker.updateLogoTemplate(variation, editorTemplate)
                // console.log('fgi_' + index)
                return (
                  <FontGridItem
                    setTemplateActive={setTemplateActive}
                    key={'fgi_' + index}
                    filter={filter}
                    variation={{ ...merged }}
                  />
                )
              })}
              {showAmount < variations.length && (
                <CenterButtonWrapper>
                  <Button color='secondary' onClick={() => setShowAmount(showAmount + INCREASE_AMOUNT)}>
                    More
                  </Button>
                </CenterButtonWrapper>
              )}
            </>
          ) : (
            <div>no results</div>
          )}
        </div>
      </VariationGrid>
    </VariationAreaBox>
  )
}

VariationArea.propTypes = {
  editorTemplate: PropTypes.object.isRequired,
  inverted: PropTypes.bool,
  target: PropTypes.any,
  type: PropTypes.any,
  variationTarget: PropTypes.any.isRequired,
  variationTypes: PropTypes.any.isRequired,
  setTemplateActive: PropTypes.func.isRequired
}

export default memo(VariationArea)

const FontGridItem = props => {
  const { variation, filter, setTemplateActive } = props
  // useWhyDidYouUpdate('FontGridItem', props)
  // const divRef = useRef()
  let instance = null // useRef(new LogoInstance(variation, undefined, {}))
  // const { setTemplateActive, activeSegment } = useEditorContext()

  const fillRef = el => {
    if (!el) {
      return
    }
    if (!el.dataLogoAdded) {
      instance = new LogoInstance(variation, el, { isVariation: true })
      el.dataLogoAdded = instance
    } else {
      instance = el.dataLogoAdded
    }
  }

  useEffect(() => {
    // This is triggerd to many times
    // console.log('update variation', instance)
    if (instance) {
      instance.update(variation)
    }
  }, [variation]) // eslint-disable-line

  // for analytics
  const dataElementId = `logo-variations-${filter ? `-filter:${filter}` : ''}`

  return (
    <HoverCard className='logo-preview-wrapper variationsBox'>
      <div
        className='logo-preview variationsBox'
        ref={fillRef}
        onClick={() => setTemplateActive(instance.templateData)}
        {...getDataProperty({
          dataElementType: DataElementTypes.MENUITEM,
          dataElementLocation: DataElementLocations.RIGHT_RAIL,
          dataElementLabel: 'logo-variations-box',
          dataElementId: dataElementId
        })}
      />
    </HoverCard>
  )
}

FontGridItem.propTypes = {
  variation: PropTypes.object,
  match: PropTypes.object,
  filter: PropTypes.string,
  setTemplateActive: PropTypes.func.isRequired
}
