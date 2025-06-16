const pendingEntry = (state, key, action) => {
  const id = action.extraArguments && action.extraArguments.id
  const newEntry = {
    fulfilled: false,
    pending: true,
    error: false
  }
  return {
    ...state,
    [key]: id
      ? {
        ...state[key],
        [id]: newEntry
      }
      : newEntry
  }
}

const errorEntry = (state, key, action) => {
  const id = action.extraArguments && action.extraArguments.id
  const newEntry = {
    fulfilled: false,
    pending: false,
    error: true
  }
  return {
    ...state,
    [key]: id
      ? {
        ...state[key],
        [id]: newEntry
      }
      : newEntry
  }
}

const fulfilledEntry = (state, key, action) => {
  const id = action.extraArguments && action.extraArguments.id
  const newEntry = {
    data: action.body,
    fulfilled: true,
    pending: false,
    error: false
  }
  return {
    ...state,
    [key]: id
      ? {
        ...state[key],
        [id]: newEntry
      }
      : newEntry
  }
}

export { fulfilledEntry }

export default function createReducerEntriesForFetching (constant, key) {
  return {
    [`${constant}_PENDING`]: (state, action) => pendingEntry(state, key, action),
    [`${constant}_ERROR`]: (state, action) => errorEntry(state, key, action),
    [`${constant}_FULFILLED`]: (state, action) => fulfilledEntry(state, key, action)
  }
}
