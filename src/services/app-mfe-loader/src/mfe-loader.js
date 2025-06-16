const { findComponentByName } = require('./helpers/find-component-by-name')
const { addScript } = require('./helpers/add-script')

const isUrl = name => name.startsWith('https://') || name.startsWith('http://')

export const mfeLoader = (componentName, componentMapUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      // If the component name is a URL, load the script directly
      if (isUrl(componentName)) {
        addScript(componentName).then(() => resolve())
        return
      }
      // Otherwise, load the component map and find the component URL
      // eslint-disable-next-line
      const fetchComponentMap = await fetch(componentMapUrl)

      // If the component map is not found, throw an error
      if (!fetchComponentMap.ok) {
        throw new Error(`Component map not found at ${componentMapUrl} `)
      }

      const componentMap = await fetchComponentMap.json()
      const componentUrl = findComponentByName(componentName, componentMap)

      if (componentUrl == null) {
        throw new Error(`Component ${componentName} not found in component map`)
      }
      // Add the script to the page
      addScript(componentUrl, componentName).then(() => resolve())
    } catch (err) {
      console.warn(err)
      reject(err)
    }
  })
}
