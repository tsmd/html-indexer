const _ = require('lodash')

module.exports = class Indexer {
  constructor (settings) {
    this.settings = settings
    this.exports = []
  }

  retrieveData (entry, $) {
  }

  compare (a, b) {
    return 0
  }

  addIndex (context) {
  }

  classify (context, next) {
    next(context)
  }
}
