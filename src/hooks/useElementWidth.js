import get from 'lodash/get'
import { useEffect, useState } from 'react'

function useElementWidth (ref) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (ref.current) {
      const width = get(ref.current, 'offsetWidth', 0)
      setWidth(width)
    }
  }, [ref.current])

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        if (ref.current) {
          const width = get(ref.current, 'offsetWidth', 0)

          setWidth(width)
        }
      }, 200)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return width
}

export default useElementWidth
