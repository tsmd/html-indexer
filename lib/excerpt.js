const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class ExcerptIndexer extends Indexer {
  constructor (settings = {}) {
    settings = _.defaults(settings, {
      length: 200
    })

    if (!settings.selector) {
      throw Error('selector property is mandatory.')
    }

    super(settings)
  }

  retrieveData (entry, $) {
    entry.excerpt = this.getExcerpt($(this.settings.selector).eq(0).text()
  }

  getExcerpt (fullText) {
    const normalizedText = fullText.trim().replace(/\s+/g, ' ')
    return normalizedText.slice(0, this.settings.length)
  }
}
