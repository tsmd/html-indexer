const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class TitleIndexer extends Indexer {
  constructor (settings = {}) {
    if (!settings.selector) {
      throw Error('selector property is mandatory.')
    }

    if (!settings.exports) {
      throw Error('exports property is mandatory.')
    }

    super(settings)
  }

  retrieveData (entry, $) {
    entry[this.settings.exports] = $(this.settings.selector).html()
  }
}
