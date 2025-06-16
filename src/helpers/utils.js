export const handleResponse = async response => {
  const responseContent = await response.text()

  if (responseContent.length === 0) {
    throw new Error(response)
  }

  if (!response.ok) {
    throw new Error(response)
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    return JSON.parse(responseContent)
  }

  return responseContent
}

export const performFetch = async (url, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  }

  const mergedOptions = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    ...(options.body && { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) })
  }

  const response = await window.fetch(url, mergedOptions)
  const data = await handleResponse(response)
  return data
}

export default window.fetch
