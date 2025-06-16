import tinycolor from 'tinycolor2'

const componentToHex = c => {
  const hex = c.toString(16).toUpperCase()
  return hex.length === 1 ? '0' + hex : hex
}

const rgbToHex = (r, g, b) => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export const isValidHex = hex => {
  // disable hex4 and hex8
  const lh = String(hex).charAt(0) === '#' ? 1 : 0
  return hex.length !== 4 + lh && hex.length < 7 + lh && tinycolor(hex).isValid()
}

const hexToRgb = hex => {
  let c
  if (/^#([a-f0-9]{3}){1,2}$/i.test(hex)) {
    c = hex.substring(1).split('')
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }

    c = '0x' + c.join('')
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255]
  }

  return null
}

const checkBackground = rgbArray => {
  const r = rgbArray.r / 255
  const g = rgbArray.g / 255
  const b = rgbArray.b / 255

  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5
  // True means light background, needing dark text
}

const shadeColor = (color, percent) => {
  let R = parseInt(color.substring(1, 3), 16)
  let G = parseInt(color.substring(3, 5), 16)
  let B = parseInt(color.substring(5, 7), 16)

  R = parseInt((R * (100 + percent)) / 100)
  G = parseInt((G * (100 + percent)) / 100)
  B = parseInt((B * (100 + percent)) / 100)

  R = R < 255 ? R : 255
  G = G < 255 ? G : 255
  B = B < 255 ? B : 255

  const RR = R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16)
  const GG = G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16)
  const BB = B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16)

  return '#' + RR + GG + BB
}

export { hexToRgb, rgbToHex, checkBackground, shadeColor }
