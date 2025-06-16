import * as constants from './constants'
import SymbolResources from 'core/logo-maker/resources/symbol-resources'

export const setIconPref = icon => ({
  type: constants.ONBOARDING_SET_ICON_PREF,
  icon
})
export const setIconsForEditor = icon => ({
  type: constants.SET_ICONS_FOR_EDITOR,
  icon
})

export const findIconsByKeyword = (keyword = 'diamond', limit = 18) => ({
  shouldCallAPI: state =>
    !state.icons.keywordIconsPending &&
    (!state.icons.keywordIcons.data ||
      !state.icons.keywordIcons.data.result ||
      state.icons.keyword !== keyword ||
      limit * 4 > state.icons.keywordIcons.data.result.length),
  callAPI: dispatch => {
    SymbolResources.getInstance()
      .startSearch(keyword)
      .then(result => {
        dispatch({
          type: `${constants.FIND_ICONS_BY_KEYWORD}_FULFILLED`,
          extraArguments: { keyword },
          body: result
        })
      })
    return {
      type: `${constants.FIND_ICONS_BY_KEYWORD}_PENDING`,
      extraArguments: { keyword }
    }
  }
})
