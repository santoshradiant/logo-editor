import * as JSZip from 'jszip'

/**
 * @param {string} url
 * @param {Object} options
 * @param {boolean} options.rewriteAssetURLs False by default. Set to true to replace URLs in the GLTF file with local blob URLs.
 * @param {function} options.onProgress Function called with percentage everytime progress increases.
 */

class GLTFModelLoader {
  constructor (url, options) {
    this.url = url
    this.options = options
    this.progress = 0
  }

  /**
   * @return {Promise} Promise that resolves with an assetmap with all assets and url of the root gltf file
   */
  download () {
    this.progress = 0

    this._onProgress({
      type: 'download',
      progress: 0.0
    })
    ;(function () {
      'use strict'

      function isHttpFamily (url) {
        const a = document.createElement('a')
        a.href = url
        return a.protocol === 'http:' || a.protocol === 'https:'
      }

      function HttpProgressReader (url, options) {
        const that = this

        function getData (callback, onerror) {
          let request
          if (!that.data) {
            request = new window.XMLHttpRequest()
            request.addEventListener(
              'load',
              function () {
                if (!that.size) {
                  that.size = Number(request.getResponseHeader('Content-Length')) || Number(request.response.byteLength)
                }
                that.data = new Uint8Array(request.response)
                callback()
              },
              false
            )
            request.addEventListener('error', onerror, false)
            request.open('GET', url)
            request.responseType = 'arraybuffer'
            request.send()
            request.onprogress = function (e) {
              if (e.lengthComputable) {
                if (options.onProgress && typeof options.onProgress === 'function') {
                  options.onProgress({
                    url: url,
                    loaded: e.loaded,
                    total: e.total
                  })
                }
              }
            }
          } else {
            callback()
          }
        }

        function init (callback, onerror) {
          if (!isHttpFamily(url)) {
            // For schemas other than http(s), HTTP HEAD may be unavailable,
            // so use HTTP GET instead.
            getData(callback, onerror)
            return
          }
          const request = new window.XMLHttpRequest()
          request.addEventListener(
            'load',
            function () {
              that.size = Number(request.getResponseHeader('Content-Length'))
              // If response header doesn't return size then prefetch the content.
              if (!that.size) {
                getData(callback, onerror)
              } else {
                callback()
              }
            },
            false
          )
          request.addEventListener('error', onerror, false)
          request.open('HEAD', true)
          request.send()
        }

        function readUint8Array (index, length, callback, onerror) {
          getData(function () {
            callback(new Uint8Array(that.data.subarray(index, index + length)))
          }, onerror)
        }

        that.size = 0
        that.init = init
        that.readUint8Array = readUint8Array
      }

      // HttpProgressReader.prototype = new Reader()
      // HttpProgressReader.prototype.constructor = HttpProgressReader
      JSZip.HttpProgressReader = HttpProgressReader
    })()

    const url = this.url
    return new Promise(
      function (resolve, reject) {
        // let assetMap = {}
        // let gltfUrl = 'scene.gltf'
        this._readZip(
          url,
          function (e) {
            this._onProgress({
              type: 'download',
              progress: e.loaded / e.total
            })
          }.bind(this)
        )
          .then(
            function (entries) {
              return this._parseZip(entries)
            }.bind(this)
          )
          .then(function (assetMap) {
            resolve(assetMap)
          })
          .catch(reject)
      }.bind(this)
    )
  }

  _onProgress (message) {
    const ZIP_PROGRESS_FACTOR = 0.5
    let value

    if (message.type === 'download') {
      value = message.progress * (1 - ZIP_PROGRESS_FACTOR)
    }

    if (message.type === 'zip') {
      if (message.progress < ZIP_PROGRESS_FACTOR) {
        value = ZIP_PROGRESS_FACTOR
      }
      value = 1 * ZIP_PROGRESS_FACTOR + message.progress * ZIP_PROGRESS_FACTOR
    }

    if (message.type === 'final') {
      value = message.progress
    }

    value = Math.floor(100 * value)

    if (value >= this.progress) {
      this.progress = value
      if (this.options.onProgress) {
        this.options.onProgress(this.progress)
      }
    }
  }

  _readZip (url, onProgress) {
    return new Promise(function (resolve, reject) {
      const reader = new JSZip.HttpProgressReader(url, {
        onProgress: onProgress,
        mode: 'cors'
      })
      JSZip.createReader(
        reader,
        function (zipReader) {
          zipReader.getEntries(resolve)
        },
        reject
      )
    })
  }

  _parseZip (entries) {
    function _parseZip (resolve, reject) {
      let url
      let entry
      const promises = []
      let completedPromises = 0
      let promise

      for (let i = 0, l = entries.length; i < l; i++) {
        entry = entries[i]

        if (entry.directory === true) {
          continue
        }

        if (entry.filename.match(/\.gltf$/)) {
          url = entry.filename
        }

        promise = this._saveEntryToBlob(
          entry,
          function onProgress (currentIndex, totalIndex) {
            this._onProgress({
              type: 'zip',
              progress: currentIndex / totalIndex / entries.length + completedPromises / entries.length
            })
          }.bind(this)
        )

        promise.then(function (result) {
          completedPromises++
          return result
        })

        promises.push(promise)
      }

      if (!url) {
        return reject('Can not find a .gltf file')
      }

      const blobsReady = Promise.all(promises)
      blobsReady.then(
        function (blobs) {
          this._onProgress({
            type: 'final',
            progress: 1.0
          })

          const assets = blobs.reduce(function (acc, cur) {
            acc[cur.name] = cur.url
            return acc
          }, {})

          const shouldRewriteAssetsURLs =
            this.options &&
            Object.property.hasOwnProperty.call(this.options, 'rewriteAssetURLs') &&
            this.options.rewriteAssetURLs === true

          if (shouldRewriteAssetsURLs) {
            const assetsPromise = this._rewriteAssetURLs(assets, url, blobs)
            assetsPromise.then(function (modifiedAssets) {
              resolve({
                assets: assets,
                originalAssets: Object.assign({}, assets),
                modifiedAssets: modifiedAssets,
                url: url
              })
            })
          } else {
            resolve({
              assets: assets,
              originalAssets: Object.assign({}, assets),
              modifiedAssets: null,
              url: url
            })
          }
        }.bind(this)
      )
    }

    return new Promise(_parseZip.bind(this))
  }

  _rewriteAssetURLs (assets, gltfPath, blobs) {
    return new Promise(function (resolve, reject) {
      const newAssets = Object.assign({}, assets)
      const reader = new window.FileReader()

      const gltfBlob = blobs.reduce(function (acc, cur) {
        if (cur.name === gltfPath) {
          return cur
        }
        return acc
      }, null)

      if (!gltfBlob) {
        return reject(new Error('Cannot rewrite glTF (glTF not found)'))
      }

      reader.onload = function () {
        try {
          const json = JSON.parse(reader.result)

          // Replace original buffers and images by blob URLs
          if (Object.property.hasOwnProperty.call(json, 'buffers')) {
            for (let i = 0; i < json.buffers.length; i++) {
              json.buffers[i].uri = newAssets[json.buffers[i].uri]
            }
          }

          if (Object.property.hasOwnProperty.call(json, 'images')) {
            for (let i = 0; i < json.images.length; i++) {
              json.images[i].uri = newAssets[json.images[i].uri]
            }
          }

          const fileContent = JSON.stringify(json, null, 2)
          const updatedBlob = new window.Blob([fileContent], { type: 'text/plain' })
          const gltfBlobUrl = window.URL.createObjectURL(updatedBlob)
          newAssets[gltfPath] = gltfBlobUrl
          resolve(newAssets)
        } catch (e) {
          reject(new Error('Cannot parse glTF file', e))
        }
      }
      reader.readAsText(gltfBlob.blob)
    })
  }

  _saveEntryToBlob (entry, onProgress) {
    return new Promise(function (resolve, reject) {
      entry.getData(
        new JSZip.BlobWriter('text/plain'),
        function onEnd (data) {
          const url = window.URL.createObjectURL(data)
          resolve({
            name: entry.filename,
            url: url,
            blob: data
          })
        },
        onProgress
      )
    })
  }
}

export default GLTFModelLoader
