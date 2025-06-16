import UndoRedoInstance from 'core/undo-redo/undo-redo-instance'
import useUndoRedoStack from 'hooks/useUndoRedoStack'

const useSingletonUndoRedo = ({ initialPresent }) => {
  const undoRedoInstance = UndoRedoInstance.getInstance()

  if (!undoRedoInstance.undoRedoState.present || initialPresent?.id !== undoRedoInstance.undoRedoState.present.id) {
    undoRedoInstance.reset()
  }

  const { state, ...other } = useUndoRedoStack({ initialPresent, initialState: undoRedoInstance.undoRedoState })

  // update singleton object
  undoRedoInstance.update(state)

  return { state, ...other }
}

export default useSingletonUndoRedo
