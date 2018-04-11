const _ = require('lodash')

module.exports = class Indexer {
  constructor (settings) {
    this.settings = settings
    this.exports = []
  }

  retrieveData (entry, $) {
  }

  addIndex (context) {
  }

  classify (context, next) {
    next(context)
  }
}
