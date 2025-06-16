import BaseLayout from './layout-base'

class BrandLayout extends BaseLayout {
  getLayout (topFrom) {
    // const isSingle = this.settings.layout.brand.fontStyle === 'single'
    // let bn = this.settings.text ? this.settings.text.brandName : ''
    // let m = bn.match(WordResources.wordSplitRegEx)
    const wordCount = this.options.wordInstance.getWordCount() // m && m.length ? m.length : 0
    // console.log('Word count: ', wordCount, this.settings.text.brandName)
    const isHorizontal = this.settings.layout.brand.alignment === 'horizontal' && wordCount > 1
    const layout = {
      type: 'group',
      tag: 'brand',
      hovertag: 'brand',
      position: {
        left: 0,
        topFrom: topFrom,
        autoWidth: true,
        autoHeight: true
      },
      layers: [
        {
          type: 'text',
          tag: 'brand1',
          position: {
            top: 0,
            left: 0,
            autoHeight: true,
            autoWidth: true
          },
          text: '{brandName:0}',
          font: {
            fontFrom: 'brand1',
            family: 'egoregular', // Default font does not matter
            size: 56,
            colorFrom: 'brand1',
            colorFromAlt: 'brand2'
          }
        }
      ]
    }

    if (isHorizontal && this.settings.logoVersion > 0) {
      layout.layers[0].text = '{brandName}'
      return layout
    }

    // In the future max could be removed, but 1st we have to decide how to handle old logo's who count everything after word 1 as word 2
    for (let ix = 1; ix < Math.min(wordCount, 2); ix++) {
      layout.layers.push({
        type: 'text',
        tag: 'brand2',
        position: isHorizontal
          ? {
            leftFrom: 'child(-1).right + 0.0055', // child(-1).height * 0.325',
            useBaseLine: true,
            autoHeight: true,
            autoWidth: true
          }
          : {
            topFrom: 'child(-1).bottom + 0.003', // child(-1).height * 0.125',
            widthFrom: 'child(-1)',
            autoHeight: true
          },
        text: '{brandName:' + ix + '}',
        font: {
          family: 'egooutline', // Default font does not matter
          size: 56,
          fontFrom: 'brand2',
          colorFrom: 'brand2',
          colorFromAlt: 'brand1'
        }
      })
    }

    return layout
  }
}

BrandLayout.prototype.variations = {
  alignment: {
    horizontal: { weight: 2 },
    vertical: { weight: 3 }
  }

  // fontStyle: {
  //   single: { weight: 1 },
  //   multiple: { weight: 1 }
  // }
}

export default BrandLayout
