import React, { useCallback, useEffect } from 'react'
import useEventListener from 'hooks/useEventListener'
import LogoInstance from 'core/logo-maker/logo-instance'
import debounce from 'lodash/debounce'
import shuffle from 'lodash/shuffle'

const useLogoInstances = (template, instanceCount) => {
  const instancesRefs = Array.from({ length: instanceCount }, () => ({
    instance: new LogoInstance({ ...template, color: { ...template.color, palette: shuffle(template.color.palette) } }),
    ref: React.createRef()
  }))

  useEffect(() => {
    instancesRefs.current = instancesRefs.map(i => {
      return {
        ...i,
        instance: new LogoInstance({
          ...template,
          color: { ...template.color, palette: shuffle(template.color.palette) }
        })
      }
    })
    instancesRefs.forEach(({ instance, ref }) => {
      if (ref.current) {
        ref.current.innerHTML = ''
        instance.update()
        ref.current.appendChild(instance.getPreviewElement())
      }
    })
  }, [template, instanceCount])

  const handleResize = useCallback(() => {
    instancesRefs.forEach(({ instance }) => {
      debounce(() => instance.update(), 300)
    })
  }, [instancesRefs])

  useEventListener('resize', handleResize)

  return instancesRefs
}

export default useLogoInstances
