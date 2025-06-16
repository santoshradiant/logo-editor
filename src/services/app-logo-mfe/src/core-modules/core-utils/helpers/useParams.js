import { useLogoMFEContext } from 'modules/logo-mfe/context/logo-mfe-context.jsx'
const useParams = () => {
  const context = useLogoMFEContext()
  return { ...context, logoId: context?.state?.logoId }
}
export { useParams }
