import get from 'lodash/get'

export const getVoteMetaFromTemplateData = templateData => {
  const brandName = get(templateData.text, 'brandName')
  const slogan = get(templateData.text, 'slogan')
  const decoration = get(templateData.layout, 'decoration')
  const symbol = get(templateData.layout, 'position')

  return {
    template: JSON.stringify(templateData),
    total_characters_brand_name: brandName.length,
    total_characters_slogan: slogan.length,
    total_words_brand_name: brandName.length > 0 ? brandName.split(' ').length : 0,
    total_words_slogan: slogan.length > 0 ? slogan.split(' ').length : 0,
    decoration_style: decoration.style,
    symbol: symbol !== 'none'
  }
}

export const getSaveMetaFromTemplateData = templateData => {
  const brandName = get(templateData.text, 'brandName') || ''
  const brandNameArray = brandName.split(' ')
  const brand1 = brandNameArray[0] || ''
  const brand2 = brandNameArray[1] || ''

  const slogan = get(templateData.text, 'slogan')

  return {
    has_name1: !!brand1,
    has_name2: !!brand2,
    has_slogan: !!slogan,
    word_count: brandNameArray.filter(a => a).length,
    character_count: brandName.replace(' ', '').length,
    character_count_name1: brand1.length,
    character_count_name2: brand2.length,

    // hard coded for now
    is_designed: false,
    rating: 0
  }
}
