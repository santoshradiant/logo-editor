import React from 'react'

const EditorContext = React.createContext({})

export function useEditorContext () {
  return React.useContext(EditorContext)
}

export default EditorContext
