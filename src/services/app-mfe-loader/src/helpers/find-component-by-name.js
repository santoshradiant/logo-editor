const { isVersionGreater } = require('./is-version-greater')

export function findComponentByName (name, componentMap) {
  const nameParts = name.split('@')
  const componentName = nameParts[0]
  const version = nameParts[1]

  // Filter the components in the map by name
  const filteredComponents = Object.keys(componentMap).filter(key => key.startsWith(componentName))

  // Sort the filtered components by version number in descending order
  const sortedComponents = filteredComponents.sort((a, b) => {
    const versionA = a.split('@')[1]
    const versionB = b.split('@')[1]
    return isVersionGreater(versionB, versionA)
  })

  // Find the latest version that matches the input version
  for (const component of sortedComponents) {
    const componentVersion = component.split('@')[1]
    if (!version || componentVersion.startsWith(version)) {
      return componentMap[component]
    }
  }

  return null
}
