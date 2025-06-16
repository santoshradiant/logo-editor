function getWeight (x) {
  return !isNaN(x.weight) && isFinite(x.weight) && x.weight > 0.000001 ? x.weight * 1.0 : 1.0
}

function random (data, exp) {
  const isArray = Array.isArray(data)
  if (!isArray) {
    if (data && data.isRange) {
      const r = data.max - data.min
      return data.min + Math.pow(Math.random(), data.exp || exp || 1) * r
    }
  }

  const array = isArray ? data : Object.values(data).filter(x => getWeight(x) > 0)
  if (array.length === 0) {
    console.trace('array is empty, no random value available')
    return
  }
  let weightMax = 0
  array.forEach(x => (weightMax += getWeight(x)))
  let randomNr = Math.pow(Math.random(), exp || 1) * weightMax

  let ix = 0
  while (true) {
    const r = getWeight(array[ix])
    if ((randomNr < r && r > 0) || ix === array.length - 1) {
      break
    }
    randomNr -= r
    ix++
  }
  const value = isArray ? array[ix] : Object.keys(data)[ix]
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  } else {
    return value
  }
}

export default random
