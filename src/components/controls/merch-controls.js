import React, { memo, useState, useEffect } from 'react'
import { useParams } from 'hooks/useParams'

import Text, { useLocalize } from '@eig-builder/module-localization'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

import Controls from './index'
import { dropdownValues } from './merch-config'
import useZazzleURLGenerator from 'hooks/useZazzleURLGenerator'
import { useLogoById } from 'hooks/useLogo'
import { useEditorContext } from 'logomaker/context/editor-context'
import { MerchButton, MerchImage } from './views'

const MerchControls = () => {
  const { logoId, checkIsInNoAccountFlow = true } = useParams()
  const [selectedCategory, setSelectedCategory] = useState('All Shirts')
  const [previewImages, setPreviewImages] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('235339801117337872')
  const { setProductURL, setMerchPreviewURL } = useEditorContext()
  const [logoSrc, setLogoSrc] = useState(null)
  const { localize } = useLocalize()
  const { generateProductURL, generatePreviewURL } = useZazzleURLGenerator()
  const { data: logo, isLoading } = useLogoById(logoId, checkIsInNoAccountFlow)

  const createPreviewImages = selectedCat => {
    const category = dropdownValues.filter(cat => cat.category === selectedCat)
    const options = category[0].options
    for (let i = 0; i < options.length; i++) {
      const temp = generatePreviewURL(logoSrc, options[i].id)
      setPreviewImages(prev => [...prev, { label: options[i].label, url: temp, id: options[i].id }])
    }
  }

  useEffect(() => {
    if (logo) {
      setLogoSrc(logo.preview_image_url)
      const defaultPreviewImage = generatePreviewURL(logo.preview_image_url, dropdownValues[0].options[0].id)
      setMerchPreviewURL(defaultPreviewImage)
      const productURL = generateProductURL(logo.preview_image_url, selectedProduct)
      setProductURL(productURL)
    }
  }, [logo, isLoading])

  useEffect(() => {
    setPreviewImages([])
    createPreviewImages(selectedCategory)
  }, [logoSrc])

  const handleSelect = e => {
    setPreviewImages([])
    createPreviewImages(e.target.value)
    setSelectedCategory(e.target.value)
  }

  const handlePreviewClick = id => {
    setSelectedProduct(id)
    const image = previewImages.filter(image => image.id === id)
    setMerchPreviewURL(image[0].url)
    const productURL = generateProductURL(logoSrc, id)
    setProductURL(productURL)
  }
  return (
    <Controls.Container>
      <Controls.FieldWrapper>
        <FormControl variant='outlined' fullWidth>
          <InputLabel>
            <Text message='logomaker.segments.merch.merchSelect' />
          </InputLabel>
          <Select
            label={localize('logomaker.segments.merch.merchSelect')}
            value={selectedCategory}
            onChange={handleSelect}
          >
            {dropdownValues.map(item => {
              return (
                <MenuItem key={item.category} value={item.category}>
                  {item.category}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </Controls.FieldWrapper>
      {previewImages &&
        previewImages.length > 0 &&
        previewImages.map(image => {
          return (
            <MerchButton
              key={image.id}
              variant='contained'
              onClick={() => handlePreviewClick(image.id)}
              active={selectedProduct && selectedProduct === image.id}
            >
              <MerchImage
                src={image.url}
                alt={image.label}
                variant='square'
                active={selectedProduct && selectedProduct === image.id}
              />
            </MerchButton>
          )
        })}
    </Controls.Container>
  )
}

export default memo(MerchControls)
