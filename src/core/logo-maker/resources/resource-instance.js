class ResourceInstance {
  constructor () {
    this.state = 'none'
    this.loadFinishedEvents = []
    this.isLoaded = false
  }

  pushLoadFinished = evt => {
    if (this.loadFinishedEvents.indexOf(evt) === -1) {
      this.loadFinishedEvents.push(evt)
    }
  }

  copyFrom = instance => {
    for (let i = 0; i < instance.loadFinishedEvents.length; i++) {
      this.loadFinishedEvents.push(instance.loadFinishedEvents[i])
    }
    instance.loadFinishedEvents = []
  }

  handleLoadFinished = error => {
    this.error = error

    if (this.error) {
      this.isLoaded = true
      this.state = 'error'
      console.error('Could not load resource', this)
    } else {
      this.isLoaded = true
      this.state = 'loaded'
    }
    if (this.loadFinishedEvents.length > 0) {
      for (let i = 0; i < this.loadFinishedEvents.length; i++) {
        this.loadFinishedEvents[i](this)
      }
      this.loadFinishedEvents = []
    }
  }
}

export default ResourceInstance
