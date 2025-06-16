/*
 * This is an redux middleware, based on the shouldCallApi response the callApi,
 * will be executed or skipped. Just handle an short function with the action.
 *
 * For example:
 * function someAction = (id) => {
 *  shouldCallApi: state => !state.listOfIds.includes(id),
 *  callApi: () => {
 *    fetchCallToTheServer(..)
 *  }
 * }
 */
function callAPIMiddleware ({ dispatch, getState }) {
  return next => action => {
    const { callAPI, shouldCallAPI = () => true } = action

    if (!shouldCallAPI || !callAPI) {
      // Normal action: pass it on
      return next(action)
    }

    if (typeof callAPI !== 'function') {
      throw new Error('Expected callAPI to be a function.')
    }

    if (!shouldCallAPI(getState())) {
      return
    }

    if (typeof callAPI === 'function') {
      return dispatch(callAPI(dispatch, getState))
    }

    return dispatch(callAPI)
  }
}

export default callAPIMiddleware
