// https://github.com/binarymax/floodfill.js/blob/master/floodfill.js
// Copyright(c) Max Irwin - 2011, 2015, 2016
// MIT License
function pixelCompare (i, targetcolor, fillcolor, data, length, tolerance) {
  if (i < 0 || i >= length) return false // out of bounds
  if (data[i + 3] === 0 && fillcolor.a > 0) return true // surface is invisible and fill is visible

  if (
    Math.abs(targetcolor[3] - fillcolor.a) <= tolerance &&
    Math.abs(targetcolor[0] - fillcolor.r) <= tolerance &&
    Math.abs(targetcolor[1] - fillcolor.g) <= tolerance &&
    Math.abs(targetcolor[2] - fillcolor.b) <= tolerance
  ) {
    return false
  } // target is same as fill

  if (
    targetcolor[3] === data[i + 3] &&
    targetcolor[0] === data[i] &&
    targetcolor[1] === data[i + 1] &&
    targetcolor[2] === data[i + 2]
  ) {
    return true
  } // target matches surface

  if (
    Math.abs(targetcolor[3] - data[i + 3]) <= 255 - tolerance &&
    Math.abs(targetcolor[0] - data[i]) <= tolerance &&
    Math.abs(targetcolor[1] - data[i + 1]) <= tolerance &&
    Math.abs(targetcolor[2] - data[i + 2]) <= tolerance
  ) {
    return true
  } // target to surface within tolerance

  return false // no match
}
function pixelCompareAndSet (i, targetcolor, fillcolor, data, length, tolerance) {
  if (pixelCompare(i, targetcolor, fillcolor, data, length, tolerance)) {
    // fill the color
    // AK: Modified to use lighness of underlying pixel
    const l = (data[i] + data[i + 1] + data[i + 2]) / 765.0
    data[i + 0] = ~~(fillcolor.r * l)
    data[i + 1] = ~~(fillcolor.g * l)
    data[i + 2] = ~~(fillcolor.b * l)
    data[i + 3] = fillcolor.a
    return true
  }
  return false
}
function floodfill (data, x, y, fillcolor, tolerance, width, height) {
  const length = data.length
  const Q = []
  let i = (x + y * width) * 4
  // NOSONAR
  let e = i
  // NOSONAR
  let w = i
  let me
  let mw
  const w2 = width * 4

  const targetcolor = [data[i], data[i + 1], data[i + 2], data[i + 3]]

  if (!pixelCompare(i, targetcolor, fillcolor, data, length, tolerance)) {
    return false
  }
  Q.push(i)
  while (Q.length) {
    i = Q.pop()
    if (pixelCompareAndSet(i, targetcolor, fillcolor, data, length, tolerance)) {
      e = i
      w = i
      mw = parseInt(i / w2) * w2 // left bound
      me = mw + w2 // right bound
      while (mw < w && mw < (w -= 4) && pixelCompareAndSet(w, targetcolor, fillcolor, data, length, tolerance)); // go left until edge hit
      while (me > e && me > (e += 4) && pixelCompareAndSet(e, targetcolor, fillcolor, data, length, tolerance)); // go right until edge hit
      for (let j = w + 4; j < e; j += 4) {
        if (j - w2 >= 0 && pixelCompare(j - w2, targetcolor, fillcolor, data, length, tolerance)) Q.push(j - w2) // queue y-1
        if (j + w2 < length && pixelCompare(j + w2, targetcolor, fillcolor, data, length, tolerance)) Q.push(j + w2) // queue y+1
      }
    }
  }
  return data
}

export default floodfill
