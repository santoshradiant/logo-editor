import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import LogoMakerContext from 'logomaker/context/editor-context'
import Text from '@eig-builder/module-localization'
import LogoInstance from 'core/logo-maker/logo-instance'
import Card from '@mui/material/Card'

import PageHeader from '@eig-builder/compositions-page-header'
import get from 'lodash/get'
import Tabs from '@eig-builder/compositions-responsive-tabs'
import { styled } from '@mui/material/styles'
import FontResources from 'core/logo-maker/resources/font-resources'
import useInterval from 'hooks/useInterval'
import { DataElementLocations, DataElementTypes, getDataProperty } from '@eig-builder/core-utils/helpers/tagging-helper'
import Breakpoints, { useMediaQuery } from '@eig-builder/core-utils/hooks/useResponsiveQuery'

import Button from '@mui/material/Button'
import '../../modules/onboarding/style/onboarding.scss'
import { uniqueId } from 'lodash'

const INCREASE_AMOUNT = 8

const HoverCard = styled(Card)`
  overflow: visible;
  position: relative;
  margin: ${({ theme }) => theme.spacing(2)};

  &:hover {
    cursor: pointer;
    box-shadow:
      0 0 0 1px ${(props) => props.theme.palette.white.main},
      0 0 0 3px ${(props) => props.theme.palette.primary.main},
      0 4px 8px rgba(0, 0, 0, 0.2) !important;
    transition: box-shadow ${(props) => props.theme?.interactivity?.transition};
    > div {
      opacity: 0.4;
    }
    &:before {
      opacity: 0;
      transition: opacity ${(props) => props.theme?.interactivity?.transition};
    }
  }
`
const VariationAreaBox = styled('div')`
  height: calc(100vh - 64px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  width: 25vw;
  min-width: 400px;
  background: white;
  box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.06);

  padding: 16px;

  @media screen and (max-width: ${Breakpoints.EXTRA_LARGE_DESKTOP}) {
    padding: 16px 16px 0;
    min-width: 100px;
  }

  @media screen and (max-width: ${Breakpoints.LARGE_DESKTOP}px) {
    width: 100%;
    height: calc(100% - 50px);
  }
`
const VariationGrid = styled('div')`
  width: 100%;
  @media (min-height: 600px) {
    overflow-y: auto;
    overflow-x: hidden;
  }
`
const TopWrapper = styled('div')`
  width: 100%;
`
const RelativeTabBox = styled('div')`
  position: relative;
  width: 100%;
  margin-top: -20px;
  justify-content: center;
  display: flex;
  margin-bottom: 12px;

  /* Hack for the tabs component */
  .container {
    display: contents;
  }
`

const StyledVariationBox = styled('div')`
  position: absolute;
  width: 100%;
  height: 100%;
  border: ${(props) => (props.selected ? `2px solid ${props.theme.palette.primary.main}` : '2px solid transparent')};

  .svg-hover-area {
    pointer-events: none;
  }
`

const VariationArea = () => {
  const {
    triggerVariationsUpdate,
    logoMaker,
    segments,
    activeSegment,
    setTemplateActive,
    editorTemplate,
    customVariationTrigger
  } = useContext(LogoMakerContext)
  const [currentTab, setCurrentTab] = useState(0)
  const [showAmount, setShowAmount] = useState(14)
  const [variations, setVariations] = useState([])
  const [variationStack, updateVariationStack] = useState(0)
  const [variationFilter, setVariationFilter] = useState(null)
  const [selectedVariation, setSelectedVariation] = useState()
  const isMobile = useMediaQuery({ query: `(max-width: ${Breakpoints.LARGE_DESKTOP}px)` })

  if (selectedVariation === '') {
  } // AK if i remove selectedVariation from the line above setSelectedVariation becomes broken

  const containerScrollRef = useRef(null)
  const foundSegment = segments.find((s) => s.name === activeSegment)
  const { variationTarget, variationTypes } = foundSegment || {}

  useEffect(() => {
    setCurrentTab(0)
  }, [activeSegment])

  const { target, type = 'layout', variationFilter: VariationFilter } = get(variationTypes, `${currentTab || 0}`, {})

  const mySetSelectedVariation = (x) => {
    setSelectedVariation(x)
    if (target === 'decoration') {
      triggerVariationsUpdate()
    }
  }

  const _getFontCategory = (editorTemplate, variationTarget) => {
    const FontResource = FontResources.getInstance()
    const currentFont = get(editorTemplate, `font.${variationTarget}.id`)
    const fontCategory = FontResource.getCategoryForFont(currentFont) || 'decorative'
    return fontCategory
  }

  const filter = variationFilter || _getFontCategory(editorTemplate, target)

  useEffect(() => {
    updateVariationStack(new Date().getTime())
  }, [editorTemplate, variationFilter, currentTab]) // eslint-disable-line

  const getVariationStr = (templateData) =>
    logoMaker.doNotVariate.map((x) => JSON.stringify(get(templateData, x))).join(':')
  const editorVariationStr = useMemo(() => getVariationStr(editorTemplate), [editorTemplate])

  const generateVariations = useCallback(() => {
    const { generateFontPreviewStyles, generateVariations } = logoMaker
    let variations = null
    if (generateFontPreviewStyles && generateVariations) {
      if (type === 'font') {
        if (!!editorTemplate && !!filter && !!variationTarget) {
          variations = logoMaker.generateFontPreviewStyles(editorTemplate, filter, variationTarget)
        }
      } else {
        if (editorTemplate) {
          variations = logoMaker.generateVariations(editorTemplate, target || variationTarget)
        }
      }
    }
    if (!variations) {
      return
    }
    const uniqueVariations = []
    const hashedVariations = {}
    for (const templateData of variations) {
      const id = uniqueId('fgi_')
      const varStr = getVariationStr({ id, ...templateData })
      if (!hashedVariations[varStr]) {
        hashedVariations[varStr] = { id, ...templateData }
        uniqueVariations.push({ id, ...templateData })
      }
    }

    return uniqueVariations
  }, [editorTemplate, logoMaker, filter, target, type, variationTarget])

  useEffect(() => {
    if (editorTemplate) {
      setShowAmount(14)
      setVariations(generateVariations())
      containerScrollRef.current && containerScrollRef.current.parentElement.scrollTo(0, 0)
      updateVariationStack(0)
    }
  }, [currentTab, variationFilter, activeSegment, customVariationTrigger, editorTemplate]) // eslint-disable-line

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
  const tabs = variationTypes.map((vT, index) => ({
    label: vT.label,
    value: index,
    key: index
  }))

  LogoInstance.updateMD5(editorTemplate)

  const variationMemo = useMemo(() => {
    return variations && variations.length ? (
      <>
        {variations.slice(0, showAmount).map((variation, index) => {
          const merged = logoMaker.updateLogoTemplate(variation, editorTemplate)
          const variationStr = getVariationStr(merged)
          const selectedItem = variationStr === editorVariationStr
          return (
            <FontGridItem
              key={variation.id}
              variationId={variation.id}
              selectedVariation={selectedItem}
              setTemplateActive={setTemplateActive}
              activeSegment={activeSegment}
              setSelectedVariation={mySetSelectedVariation}
              filter={filter}
              currentTab={tabs[currentTab]}
              variation={merged}
            />
          )
        })}
        {showAmount < variations.length && (
          <Button
            fullWidth
            variant='outlined'
            className='mt-2 mb-4 ml-2 mr-2'
            onClick={() => setShowAmount(showAmount + INCREASE_AMOUNT)}
            dataElementLocation={DataElementLocations.BODY}
            dataElementLabel='logomaker-variations-more'
            dataElementId='logomaker-variations-more-button'
          >
            More
          </Button>
        )}
      </>
    ) : (
      <div>no results</div>
    )
  }, [
    variations,
    selectedVariation,
    activeSegment,
    setTemplateActive,
    filter,
    editorVariationStr,
    currentTab,
    showAmount
  ])

  return (
    <VariationAreaBox>
      <TopWrapper>
        {!isMobile && <PageHeader title={<Text message='logomaker.variationTitle' />} />}

        {/* Show only when there are multiple options "Een is geen" */}
        {tabs && tabs.length > 1 && (
          <RelativeTabBox>
            <Tabs
              tabs={tabs}
              value={currentTab}
              handleChange={(currentTab) => setCurrentTab(currentTab)}
              dataElementType={DataElementTypes.TAB}
              dataElementLocation={DataElementLocations.RIGHT_RAIL}
              dataElementId='logomaker.variations-area.tabs'
              dataElementIdPrefix='logomaker.variations-area'
              dataElementLabel='logomaker-variations-area-tabs'
              dataElementLabelPrefix='logomaker-variations-area-tabs'
            />
          </RelativeTabBox>
        )}

        {/* The variations may have an filter component, think of categories in fonts for example */}
      </TopWrapper>
      {!isMobile && VariationFilter && <VariationFilter value={filter} setValue={setVariationFilter} />}
      <VariationGrid ref={containerScrollRef}>
        {isMobile && VariationFilter && <VariationFilter value={filter} setValue={setVariationFilter} />}

        <div
          className='logo-grid'
          style={{
            overflow: 'visible',
            height: '100%',
            width: '100%',
            margin: '-8px'
          }}
        >
          {variationMemo}
        </div>
      </VariationGrid>
    </VariationAreaBox>
  )
}

VariationArea.propTypes = {
  inverted: PropTypes.bool
}

export default memo(VariationArea)

const FontGridItem = (props) => {
  const {
    variation,
    filter,
    currentTab,
    variationId,
    setTemplateActive,
    activeSegment,
    setSelectedVariation,
    selectedVariation
  } = props
  // useWhyDidYouUpdate('FontGridItem', props)
  // const divRef = useRef()
  let instance = null // useRef(new LogoInstance(variation, undefined, {}))
  // const { setTemplateActive, activeSegment } = {setTemplateActive: ()=> {}, activeSegment: 'font'}// useEditorContext()

  const fillRef = (el) => {
    if (!el) {
      return
    }
    if (!el.dataLogoAdded) {
      instance = new LogoInstance(variation, el, { isVariation: true })
      el.dataLogoAdded = instance
    } else {
      instance = el.dataLogoAdded
    }
    if (instance) {
      instance.showCardLayout(activeSegment.startsWith('card'), !activeSegment.endsWith('back'))
    }
  }

  useEffect(() => {
    // This is triggerd to many times
    // console.log('update variation', instance)
    if (instance) {
      instance.update(variation, false, true)
    }
  }, [variation]) // eslint-disable-line

  // for analytics
  // const dataElementId = `logo-variations-${activeSegment}${currentTab ? `-tab:${currentTab.label}` : ''}${
  //   filter ? `-filter:${filter}` : ''
  // }`

  return (
    <HoverCard className='logo-preview-wrapper variationsBox'>
      <StyledVariationBox
        className='logo-preview variationsBox'
        selected={selectedVariation}
        ref={fillRef}
        onClick={() => {
          setSelectedVariation(variationId)
          setTemplateActive(instance.templateData)
        }}
      />
    </HoverCard>
  )
}

FontGridItem.propTypes = {
  match: PropTypes.object,
  currentTab: PropTypes.object,
  filter: PropTypes.string,
  setTemplateActive: PropTypes.func.isRequired,
  activeSegment: PropTypes.any.isRequired,
  variationId: PropTypes.string.isRequired,
  variation: PropTypes.object,
  selectedVariation: PropTypes.bool.isRequired,
  setSelectedVariation: PropTypes.func.isRequired
}
