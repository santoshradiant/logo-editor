import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userIsInNoAccountFlow } from 'modules/application-config'

import TemporaryLogoClient from 'clients/temporary-logo.client'
import LogoClient from 'clients/logo.client'
import isNil from 'lodash/isNil'

const useLogoById = (logoId, checkIsInNoAccountFlow = true) => {
  const { data, isLoading, ...others } = useQuery({
    queryKey: ['logo', logoId],
    queryFn: () => {
      if (checkIsInNoAccountFlow) {
        return userIsInNoAccountFlow() ? TemporaryLogoClient.getLogo(logoId) : LogoClient.getLogo(logoId)
      } else {
        return LogoClient.getLogo(logoId)
      }
    },

    enabled: !isNil(logoId),
    refetchOnWindowFocus: false
  })

  return {
    data,
    isLoading,
    ...others
  }
}
const useLogos = () => {
  return useQuery({ queryKey: ['my-logos'], queryFn: LogoClient.getLogos, refetchOnWindowFocus: false })
}

const useLogoUpdate = (checkIsInNoAccountFlow = true) => {
  const queryClient = useQueryClient()

  const updateLogo = useMutation({
    mutationFn: ({ logoId, logo }) => {
      if (checkIsInNoAccountFlow) {
        return userIsInNoAccountFlow()
          ? TemporaryLogoClient.updateLogo(logoId, logo)
          : LogoClient.updateLogo(logoId, logo)
      } else {
        return LogoClient.updateLogo(logoId, logo)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries('logo')
    }
  })
  return updateLogo
}

const useSaveLogo = (checkIsInNoAccountFlow = true) => {
  const queryClient = useQueryClient()

  const save = useMutation({
    mutationFn: (logo) => {
      if (checkIsInNoAccountFlow) {
        return userIsInNoAccountFlow() ? TemporaryLogoClient.saveLogo(logo) : LogoClient.saveLogo(logo)
      } else {
        return LogoClient.saveLogo(logo)
      }
    },

    onSuccess: () => queryClient.invalidateQueries('logos')
  })
  return save
}

const useMarkLogoDownloaded = () => {
  return useMutation({ mutationFn: (logoId) => LogoClient.markLogoDownloaded(logoId) })
}

const useDuplicateLogo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (logoId) => LogoClient.duplicateLogo(logoId),
    onSuccess: () => {
      queryClient.invalidateQueries('logos')
    }
  })
}
const useDeleteLogo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (logoId) => LogoClient.deleteLogo(logoId),
    onSuccess: () => {
      queryClient.invalidateQueries('logos')
    }
  })
}

export { useSaveLogo, useDeleteLogo, useDuplicateLogo, useMarkLogoDownloaded, useLogoById, useLogoUpdate, useLogos }
