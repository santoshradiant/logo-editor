/*
 * The UndoRedo instance is an singleton pattern instance that
 * lives over router changes, or component renders, or others.
 * It's been used with the undo-redo stack hook.
 *
 */

let instance = null
const initialState = {
  past: [],
  present: null,
  future: []
}

class UndoRedoInstance {
  static getInstance () {
    if (instance) {
      return instance
    }

    instance = new UndoRedoInstance()
    return instance
  }

  reset = () => {
    this.undoRedoState = initialState
  }

  update = state => {
    this.undoRedoState = state
  }

  constructor () {
    this.undoRedoState = initialState
  }
}

export default UndoRedoInstance
