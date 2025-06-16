const timeOuts = []
const delay = (callback, id, milliseconds, value) => {
  if (timeOuts[id]) {
    clearTimeout(timeOuts[id])
  }
  timeOuts[id] = setTimeout(() => {
    callback()
    delete timeOuts[id]
  }, milliseconds)
}

export default delay
