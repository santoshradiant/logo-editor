import React, { useEffect, useState } from 'react'
import App from './app'

let AppPointer = App

export default () => {
  const [, setTriggerRender] = useState(0)

  useEffect(() => {
    if (module.hot) {
      module.hot.accept('app', () => {
        const NewRoot = require('app').default
        AppPointer = NewRoot
        setTriggerRender(new Date().getTime())
      })
    }
  }, [])

  return <AppPointer />
}
