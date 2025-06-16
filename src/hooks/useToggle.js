import { useCallback, useState } from 'react'

const useToggle = initialValue => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(
    nextValue => {
      if (typeof nextValue === 'boolean') {
        setValue(nextValue)
      } else {
        setValue(currentValue => !currentValue)
      }
    },
    [setValue]
  )

  return [value, toggle]
}

export default useToggle
