export function isVersionGreater (versionA, versionB) {
  const partsA = versionA.split('.').map(Number)
  const partsB = versionB.split('.').map(Number)

  for (let i = 0; i < partsA.length; i++) {
    if (partsA[i] > partsB[i]) {
      return 1
    } else if (partsA[i] < partsB[i]) {
      return -1
    }
  }

  return 0
}
