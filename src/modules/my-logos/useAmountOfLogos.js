import { useEffect } from 'react'
import useLocalStorage from 'hooks/useLocalStorage'

const AMOUNT_OF_LOGOS_STORAGE_KEY = 'AMOUNT_OF_LOGOS_STORAGE'
const DEFAULT_AMOUNT = 0

const useAmountOfLogos = logosLength => {
  const [amountOfLogosStorage, setAmountOfLogosStorage] = useLocalStorage(AMOUNT_OF_LOGOS_STORAGE_KEY, DEFAULT_AMOUNT)

  useEffect(() => {
    if (logosLength && amountOfLogosStorage !== logosLength) {
      setAmountOfLogosStorage(logosLength)
    }
  }, [amountOfLogosStorage, logosLength, setAmountOfLogosStorage])

  return amountOfLogosStorage
}

export default useAmountOfLogos
