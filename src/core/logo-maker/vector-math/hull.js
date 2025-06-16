/*
 (c) 2014-2019, Andrii Heonia
 Hull.js, a JavaScript library for concave hull generation by set of points.
 https://github.com/AndriiHeonia/hull

 Totaly reassembled and refactored by me (André), because the concave stuff
 was messing everything up and coordinates needed to be converted
*/

function _cross (o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function _upperTangent (pointset) {
  const lower = []
  for (let l = 0; l < pointset.length; l++) {
    while (lower.length >= 2 && _cross(lower[lower.length - 2], lower[lower.length - 1], pointset[l]) <= 0) {
      lower.pop()
    }
    lower.push(pointset[l])
  }
  lower.pop()
  return lower
}

function _lowerTangent (pointset) {
  const reversed = pointset.reverse()
  const upper = []
  for (let u = 0; u < reversed.length; u++) {
    while (upper.length >= 2 && _cross(upper[upper.length - 2], upper[upper.length - 1], reversed[u]) <= 0) {
      upper.pop()
    }
    upper.push(reversed[u])
  }
  upper.pop()
  return upper
}

// pointset has to be sorted by X
function convexHull (pointset) {
  const upper = _upperTangent(pointset)
  const lower = _lowerTangent(pointset)
  const convex = lower.concat(upper)
  convex.push(pointset[0])
  return convex
}

function _filterDuplicates (pointset) {
  const unique = [pointset[0]]
  let lastPoint = pointset[0]
  for (let i = 1; i < pointset.length; i++) {
    const currentPoint = pointset[i]
    if (lastPoint.x !== currentPoint.x || lastPoint.y !== currentPoint.y) {
      unique.push(currentPoint)
    }
    lastPoint = currentPoint
  }
  return unique
}

function _sortByX (pointset) {
  return pointset.sort(function (a, b) {
    return a.x - b.x || a.y - b.y
  })
}

function hull (pointset) {
  const points = _filterDuplicates(_sortByX(pointset))

  if (points.length < 4) {
    return points.concat([points[0]])
  }

  return convexHull(points)
}

export default hull
