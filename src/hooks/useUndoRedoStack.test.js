import { act, renderHook } from '@testing-library/react-hooks'
import useUndoRedoStack from 'hooks/useUndoRedoStack'

const firstState = {
  id: 'first',
  value: 22
}

const secondState = {
  id: 'second',
  value: {
    number: 123,
    text: 'someText'
  }
}

const thirdState = {
  id: 'third',
  value: -42
}

const fourthState = {
  id: 'fourth',
  value: 'test'
}

describe('useUndoRedoStack', () => {
  it('should set', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: secondState,
        initialState: { past: [firstState], future: [thirdState] }
      }
    })

    expect(result.current.state).toEqual({ past: [firstState], future: [thirdState], present: secondState })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.set(fourthState)
    })

    expect(result.current.state).toEqual({ past: [firstState, secondState], future: [], present: fourthState })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should reset', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: secondState,
        initialState: { past: [firstState], future: [thirdState] }
      }
    })

    expect(result.current.state).toEqual({ past: [firstState], future: [thirdState], present: secondState })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.reset(fourthState)
    })

    expect(result.current.state).toEqual({ past: [], future: [], present: fourthState })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should undo', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: secondState,
        initialState: { past: [firstState] }
      }
    })

    expect(result.current.state).toEqual({ past: [firstState], future: [], present: secondState })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)

    act(() => {
      result.current.undo()
    })

    expect(result.current.state).toEqual({ past: [], present: firstState, future: [secondState] })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('should not undo', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: thirdState,
        initialState: { future: [fourthState] }
      }
    })

    expect(result.current.state).toEqual({ past: [], future: [fourthState], present: thirdState })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.undo()
    })

    expect(result.current.state).toEqual({ past: [], future: [fourthState], present: thirdState })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('should undo twice', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: thirdState,
        initialState: { past: [firstState, secondState] }
      }
    })

    expect(result.current.state).toEqual({ past: [firstState, secondState], future: [], present: thirdState })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)

    act(() => {
      result.current.undo()
    })

    expect(result.current.state).toEqual({ past: [firstState], present: secondState, future: [thirdState] })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.undo()
    })

    expect(result.current.state).toEqual({ past: [], present: firstState, future: [secondState, thirdState] })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('should redo', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: thirdState,
        initialState: { future: [fourthState] }
      }
    })

    expect(result.current.state).toEqual({ past: [], future: [fourthState], present: thirdState })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.redo()
    })

    expect(result.current.state).toEqual({ past: [thirdState], present: fourthState, future: [] })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should not redo', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: secondState,
        initialState: { past: [firstState] }
      }
    })

    expect(result.current.state).toEqual({ past: [firstState], future: [], present: secondState })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)

    act(() => {
      result.current.redo()
    })

    expect(result.current.state).toEqual({ past: [firstState], future: [], present: secondState })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should redo twice', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: secondState,
        initialState: { future: [thirdState, fourthState] }
      }
    })

    expect(result.current.state).toEqual({ past: [], future: [thirdState, fourthState], present: secondState })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.redo()
    })

    expect(result.current.state).toEqual({ past: [secondState], present: thirdState, future: [fourthState] })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.redo()
    })

    expect(result.current.state).toEqual({ past: [secondState, thirdState], present: fourthState, future: [] })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should undo and redo', () => {
    const { result } = renderHook(useUndoRedoStack, {
      initialProps: {
        initialPresent: thirdState,
        initialState: { past: [secondState] }
      }
    })

    expect(result.current.state).toEqual({ past: [secondState], future: [], present: thirdState })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)

    act(() => {
      result.current.undo()
    })

    expect(result.current.state).toEqual({ past: [], present: secondState, future: [thirdState] })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.redo()
    })

    expect(result.current.state).toEqual({ past: [secondState], present: thirdState, future: [] })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })
})
