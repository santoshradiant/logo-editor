import { createContext } from 'react'

const LocalizeContext = createContext({
  localize: () => {},
  _localizeDebug: false
})

export default LocalizeContext
