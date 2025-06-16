import createReducerEntriesForAction from './create-reducer-entries-fetching'

// entry = [constantName, stateKey, initialState (optional)]
const getInitialState = entries => {
  const state = {}
  entries.forEach(entry => {
    state[entry[1]] = entry[2] || {
      data: null,
      pending: false,
      error: false
    }
  })
  return state
}

const createReducer = (initialState, handlers) => {
  return function reducer (state = initialState, action) {
    if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

// Creates reducer entries for basic fetching data.
const getReducerEntries = entries => {
  let reducerObject = {}
  entries.forEach(entry => {
    reducerObject = {
      ...reducerObject,
      ...createReducerEntriesForAction(entry[0], entry[1])
    }
  })
  return reducerObject
}

// Creates reducer entries that listens to the key (first argument). Then updates his own part of the state (second argument) and appends to a other array in state (third argument)
export const appendActionBodyTo = (constant, ownName, stateName) => ({
  [constant]: (state, action) => {
    return {
      ...state,
      [ownName]: {
        data: action.body,
        fulfilled: true,
        pending: false,
        error: false
      },
      [stateName]: {
        ...state[stateName],
        data: (state[stateName].data || []).concat(action.body)
      }
    }
  }
})

// Creates reducer entries that listens to the key (first argument).
// Then updates his own part of the state (second argument) and deletes action body item from a other array in state (third argument) found with propertyName (fourth argument).
export const deleteActionBodyFrom = (constant, ownName, stateName, propertyName = false) => ({
  [constant]: (state, action) => {
    return {
      ...state,
      [ownName]: {
        data: action.body,
        fulfilled: true,
        pending: false,
        error: false
      },
      [stateName]: {
        ...state[stateName],
        data: (state[stateName].data || []).filter(item =>
          propertyName
            ? item[propertyName] !== action.body[propertyName] &&
              (!action.extraArguments || item[propertyName] !== action.extraArguments[propertyName])
            : item !== action.body && item !== action.extraArguments
        )
      }
    }
  }
})

export { getInitialState, getReducerEntries }
export default (initialState, handlers) => createReducer(initialState, handlers)
