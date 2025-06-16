import { useCallback, useReducer } from 'react'

const UNDO = 'UNDO'
const REDO = 'REDO'
const SET = 'SET'
const RESET = 'RESET'

const reducer = (state, action) => {
  const { past, present, future } = state

  switch (action.type) {
    case UNDO: {
      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)

      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      }
    }

    case REDO: {
      const next = future[0]
      const newFuture = future.slice(1)

      return {
        past: [...past, present],
        present: next,
        future: newFuture
      }
    }

    case SET: {
      const { newPresent } = action

      if (newPresent === present) {
        return state
      }
      return {
        past: [...past, present],
        present: newPresent,
        future: []
      }
    }

    case RESET: {
      const { newPresent } = action

      return {
        past: [],
        present: newPresent,
        future: []
      }
    }
  }
}

const useUndo = ({ initialPresent, initialState = {} } = {}) => {
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    future: [],
    ...initialState,
    present: initialPresent
  })

  const canUndo = state.past.length !== 0
  const canRedo = state.future.length !== 0

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: UNDO })
    }
  }, [canUndo, dispatch])

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: REDO })
    }
  }, [canRedo, dispatch])

  const set = useCallback(
    newPresent =>
      dispatch({
        type: SET,
        newPresent
      }),
    [dispatch]
  )

  const reset = useCallback(
    newPresent =>
      dispatch({
        type: RESET,
        newPresent
      }),
    [dispatch]
  )

  return { state, set, undo, redo, reset, canUndo, canRedo }
}

export default useUndo
