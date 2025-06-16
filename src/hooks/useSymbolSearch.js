import { useState, useEffect, useRef } from 'react'
import { useEditorContext } from 'logomaker/context/editor-context'
import debounce from 'lodash/debounce'

export const SYMBOL_STATE = {
  RETRIEVING: 0,
  RESULTS: 1,
  NORESULTS: 2
}

const onChangeDebounced = debounce(fetchIcons => {
  fetchIcons()
}, 1000)

const useSymbolSearch = () => {
  const { logoInstance } = useEditorContext()
  const iconsInitRef = useRef(true)
  const initialsInitRef = useRef(true)

  const [search, setSearch] = useState(logoInstance.templateData.text.brandName)

  const [icons, setIcons] = useState([])
  const [initials, setInitials] = useState([])

  const [iconState, setIconState] = useState(SYMBOL_STATE.RETRIEVING)
  const [initialState, setInitialState] = useState(SYMBOL_STATE.RETRIEVING)

  useEffect(() => {
    logoInstance.getSymbolSearchIcons().then(data => {
      setIcons(data)
    })
    logoInstance.getInitialSearchIcons().then(data => {
      setInitials(data)
    })
  }, [logoInstance])

  useEffect(() => {
    if (iconsInitRef.current) {
      iconsInitRef.current = false
      return
    }
    if (icons.length > 0) {
      setIconState(SYMBOL_STATE.RESULTS)
    } else {
      setIconState(SYMBOL_STATE.NORESULTS)
    }
  }, [icons])

  useEffect(() => {
    if (initialsInitRef.current) {
      initialsInitRef.current = false
      return
    }
    if (initials.length > 0) {
      setInitialState(SYMBOL_STATE.RESULTS)
    } else {
      setInitialState(SYMBOL_STATE.NORESULTS)
    }
  }, [initials])
  const fetchIcons = symbolSearchValue => {
    if (symbolSearchValue.length > 0) {
      logoInstance.getSymbolSearchIcons(symbolSearchValue).then(data => {
        setIcons(data)
      })
      logoInstance.getInitialSearchIcons(symbolSearchValue).then(data => {
        setInitials(data)
      })
    }
  }
  const setSearchValue = value => {
    if (value.trim() === '') {
      setIconState(SYMBOL_STATE.NORESULTS)
      setInitialState(SYMBOL_STATE.NORESULTS)
    } else {
      setIconState(SYMBOL_STATE.RETRIEVING)
      setInitialState(SYMBOL_STATE.RETRIEVING)
    }
    setSearch(value)

    onChangeDebounced.cancel()
    onChangeDebounced(() => fetchIcons(value))
  }

  return { search, setSearchValue, icons, initials, iconState, initialState }
}
export default useSymbolSearch
