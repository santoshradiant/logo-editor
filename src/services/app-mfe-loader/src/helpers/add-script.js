const checkTags = (tag, componentName) => {
  return !![...document.getElementsByTagName(tag)].find(l => l['data-name'] === componentName)
}

export const addScript = (src, componentName) => {
  return new Promise(resolve => {
    if (checkTags('script', componentName)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script['data-name'] = componentName
    script.onload = () => resolve()
    document.body.appendChild(script)
  })
}
