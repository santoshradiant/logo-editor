export default function createConstantsForFetching (key) {
  const pending = `${key}_PENDING`
  const error = `${key}_ERROR`
  const fulfilled = `${key}_FULFILLED`
  return {
    [key]: key,
    [pending]: pending,
    [error]: error,
    [fulfilled]: fulfilled
  }
}
