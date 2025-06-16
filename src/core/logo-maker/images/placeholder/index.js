// import logoSvg from './placeholder.svg'

export default function getLogoPlaceholders (length) {
  const res = []
  for (let i = 0; i < length; i++) {
    res.push({
      id: i,
      name: `${i}-placeholder`,
      placeholder: true
    })
  }
  return res
}
