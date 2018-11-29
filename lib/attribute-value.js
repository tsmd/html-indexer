const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class AttributeValueIndexer extends Indexer {
  constructor (settings = {}) {
    if (!settings.selector) {
      throw Error('selector property is mandatory.')
    }

    if (!settings.name) {
      throw Error('name property is mandatory.')
    }

    if (!settings.exports) {
      throw Error('exports property is mandatory.')
    }

    super(settings)
  }

  retrieveData (entry, $) {
    entry[this.settings.exports] = $(this.settings.selector).eq(0).attr(this.settings.name).trim()
  }
}
