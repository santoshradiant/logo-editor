export const hasShape = templateData => templateData?.layout?.decoration?.style !== 'none'

export const getPaletteConfig = templateData => {
  const baseConfig = {
    decoration: hasShape(templateData) ? 1 : 2,
    brand1: 0,
    brand2: 1,
    slogan: 1,
    symbol: 3
  }

  if (hasShape(templateData) && templateData?.background?.inverse) {
    return {
      ...baseConfig,
      decoration: 0,
      brand1: 2,
      brand2: 2,
      slogan: 2
    }
  }

  return baseConfig
}

export const generateSymbol = (instance, refs, templates, intervalId) => {
  const symbolData = instance.getSymbolData(instance.templateData.symbol).symbol
  const layouts = []

  if (symbolData.isLoaded) {
    clearInterval(intervalId)
    for (let index = 0; index < refs.length; index++) {
      const ref = refs[index]
      const templateData = templates[index]
      ref.current.innerHTML = ''
      const layout = instance.createSymbolLayout(templateData)
      layout.update()
      ref.current.appendChild(layout.getPreviewElement())
      const { color } = templateData
      ref.current.style = `background: rgb(${color.palette[color.decoration]});`
      layouts.push(layout)
    }
  }

  return layouts
}
