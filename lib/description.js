const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class DescriptionIndexer extends Indexer {
  constructor (settings) {
    super(settings)
  }

  retrieveData (entry, $) {
    entry.description = $('meta[name="description"]').attr('content')
  }
}
