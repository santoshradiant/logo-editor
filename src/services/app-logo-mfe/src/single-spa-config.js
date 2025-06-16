import React from 'react'
import ReactDOM from 'react-dom'
import rootComponent from './app'
import singleSpaReact from 'single-spa-react'

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOM,
  rootComponent,
  errorBoundary: () => {
    // https://reactjs.org/docs/error-boundaries.html
    return <div>This renders when a catastrophic error occurs</div>
  }
})
