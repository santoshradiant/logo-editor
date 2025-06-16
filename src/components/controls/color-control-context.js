import React, { createContext, useState } from 'react'

export const ColorControlContext = createContext()

const ColorControlContextProvider = props => {
  const [displayedWarnings, setDisplayedWarnings] = useState([])
  return <ColorControlContext.Provider value={{ displayedWarnings, setDisplayedWarnings }} {...props} />
}

export default ColorControlContextProvider
