const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class DateIndexer extends Indexer {
  constructor (settings) {
    super(settings)
  }

  retrieveData (entry, $) {
    let date = $('meta[name="date"]').attr('content')
    if (date) {
      date = new Date(Date.parse(date))
    }
    entry.date = date
  }
}
