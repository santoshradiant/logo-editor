import UndoRedoInstance from 'core/undo-redo/undo-redo-instance'
import { renderHook } from '@testing-library/react-hooks'
import useSingletonUndoRedo from 'hooks/useSingletonUndoRedo'
import useUndoRedoStack from 'hooks/useUndoRedoStack'

jest.mock('core/undo-redo/undo-redo-instance')
jest.mock('hooks/useUndoRedoStack')

const mockUndoRedoInstance = initialState => {
  const value = {
    reset: jest.fn(),
    update: jest.fn(),
    undoRedoState: initialState
  }

  UndoRedoInstance.getInstance.mockReturnValue(value)
  return value
}

describe('useSingletonUndoRedo', () => {
  afterEach(() => {
    UndoRedoInstance.getInstance.mockClear()
  })

  it('should initialize', () => {
    const id = 1
    const initialPresent = { id }
    const initialState = { present: { id } }
    const mockState = {
      state: 123,
      other: 'other'
    }

    const { reset, update } = mockUndoRedoInstance(initialState)
    useUndoRedoStack.mockReturnValue(mockState)

    const { result } = renderHook(useSingletonUndoRedo, {
      initialProps: { initialPresent }
    })

    expect(result.current).toEqual(mockState)
    expect(reset).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(mockState.state)
    expect(useUndoRedoStack).toHaveBeenCalledWith({ initialPresent, initialState })
  })

  it('should reset UndoRedoInstance if UndoRedoInstance has no present', () => {
    const { reset } = mockUndoRedoInstance({})
    useUndoRedoStack.mockReturnValue({})

    renderHook(useSingletonUndoRedo, {
      initialProps: { initialPresent: { id: 3 } }
    })

    expect(reset).toHaveBeenCalled()
  })

  it('should reset UndoRedoInstance if UndoRedoInstance has the wrong present', () => {
    const instancePresentId = 12
    const newPresentId = 16

    const { reset } = mockUndoRedoInstance({ present: instancePresentId })
    useUndoRedoStack.mockReturnValue({})

    renderHook(useSingletonUndoRedo, {
      initialProps: { initialPresent: { id: newPresentId } }
    })

    expect(reset).toHaveBeenCalled()
  })
})
