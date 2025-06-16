import LogoClient from 'clients/logo.client'
import { useQuery, useMutation, useQueryClient } from 'react-query'

const useVoteLogo = () => {
  const { data, isLoading, ...others } = useQuery(['logo-vote'], () => LogoClient.getVotes(), {
    refetchOnWindowFocus: false
  })

  return {
    data,
    isLoading: data == null && isLoading,
    ...others
  }
}

const useDeleteLogo = cb => {
  const queryClient = useQueryClient()
  const invalidateQueries = () => {
    queryClient.invalidateQueries('logos')
  }
  const logoMutate = useMutation(LogoClient.deleteLogoVote, {
    onSuccess: () => {
      invalidateQueries()
      cb && cb()
    },
    onError: () => {
      cb && cb()
    }
  })
  return {
    invalidateQueries,
    ...logoMutate
  }
}

export default {
  useVoteLogo,
  useDeleteLogo
}
