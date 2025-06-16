const mockWindowLocation = () => {
  let location

  beforeAll(() => {
    location = window.location
    delete window.location

    window.location = { assign: jest.fn() }
  })

  afterAll(() => {
    window.location = location
  })

  afterEach(() => {
    window.location.assign.mockClear()
  })
}

export default mockWindowLocation
