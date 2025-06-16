import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const useLocalize = () => {
  const { t } = useTranslation()
  const localize = useCallback((key, values = {}) => t(key, values), [t])
  return {
    localize
  }
}

export default useLocalize
