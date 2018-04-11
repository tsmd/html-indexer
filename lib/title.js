const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class TitleIndexer extends Indexer {
  constructor (settings) {
    super(settings)
  }

  retrieveData (entry, $) {
    entry.title = $('title').text()
  }
}
