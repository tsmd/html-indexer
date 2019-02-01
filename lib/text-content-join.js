const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class TextContentJoinIndexer extends Indexer {
  constructor (settings = {}) {
    if (!settings.selector) {
      throw Error('selector property is mandatory.')
    }

    if (!settings.exports) {
      throw Error('exports property is mandatory.')
    }

    if (!settings.joiner) {
      settings.joiner = ', '
    }

    super(settings)
  }

  retrieveData (entry, $) {
    entry[this.settings.exports] = $(this.settings.selector).text().join(this.settings.joiner)
  }
}
