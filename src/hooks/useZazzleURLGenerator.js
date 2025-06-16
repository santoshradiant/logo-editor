import { ZAZZLE_ASSOCIATE_ID } from 'components/controls/merch-config'

const useZazzleURLGenerator = () => {
  const generateProductURL = (imageURL, productID) => {
    return `https://www.zazzle.com/api/create/at-${ZAZZLE_ASSOCIATE_ID}?RF=${ZAZZLE_ASSOCIATE_ID}&ax=Linkover&pd=${productID}&ed=true&tc=logobuilder&logo=${encodeURIComponent(imageURL)}`
  }

  const generatePreviewURL = (imageURL, productID) => {
    return `https://rlv.zazzle.com/svc/view?pid=${productID}&max_dim=699&at=${ZAZZLE_ASSOCIATE_ID}&t_logo_url=${encodeURIComponent(imageURL)}&cache=1`
  }

  return { generateProductURL, generatePreviewURL }
}
export default useZazzleURLGenerator
