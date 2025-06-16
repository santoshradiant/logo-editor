import { useQuery } from '@tanstack/react-query'
import LimitationsClient from 'clients/limitations.client'
import isNil from 'lodash/isNil'

const key = 'logo-maker-limitations'

const useLogoLimitations = (logo) => {
  const logoId = logo?.data?.id
  const { data, isFetching } = useQuery({
    queryKey: [key, logoId],
    queryFn: ({ queryKey: [_, logoId] }) => LimitationsClient.getLogomakerLimitations(logoId),
    enabled: !isNil(logoId),
    refetchOnWindowFocus: false
  })
  return {
    data,
    isFetching
  }
}

export default useLogoLimitations
