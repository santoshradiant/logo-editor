import * as constants from './constants'
import createReducer, { getInitialState } from 'core/redux-helpers/create-reducer'

const reducerEntries = [[constants.FIND_ICONS_BY_KEYWORD, 'keywordIcons']]

const reducer = {
  [`${constants.FIND_ICONS_BY_KEYWORD}_PENDING`]: (state, action) => ({
    ...state,
    keywordIconsPending: true
  }),
  [`${constants.FIND_ICONS_BY_KEYWORD}_FULFILLED`]: (state, action) => ({
    ...state,
    keyword: action.extraArguments.keyword,
    keywordIconsPending: false,
    keywordIcons: {
      ...state.keywordIcons,
      data: action.body
    }
  })
}

export default createReducer(getInitialState(reducerEntries), reducer)
