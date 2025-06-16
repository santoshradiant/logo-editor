import { useQuery } from '@tanstack/react-query'
import LimitationsClient from 'clients/limitations.client'

const key = 'logo-maker-account-limitations'

const useLogoAccountLimitations = () => {
  const { data, isFetching } = useQuery({
    queryKey: [key],
    queryFn: () => LimitationsClient.getLogomakerAccountLimitations(),
    refetchOnWindowFocus: false
  })
  return {
    data,
    isFetching
  }
}

export default useLogoAccountLimitations
