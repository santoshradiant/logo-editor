import React, { useEffect, useState } from 'react'
import App from './app'
import config from '../config'

let AppPointer = App

export default () => {
  const [, setTriggerRender] = useState(0)
  const { name } = config
  useEffect(() => {
    if (module.hot) {
      module.hot.accept('app', () => {
        const NewRoot = require('app').default
        AppPointer = NewRoot
        setTriggerRender(new Date().getTime())
      })
    }
  }, [])

  return (
    // we add a div here with the Parcel name zo we can scope our modal into it later through the
    // module-bootstrapper. So we have the correct scope for our styled-components.
    // Normally, this shouldnt be needed.
    <div className={`${name}`}>
      <AppPointer />
    </div>
  )
}
