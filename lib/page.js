const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class PageIndexer extends Indexer {
  constructor (settings) {
    super(settings)
    this.exports = ['page', 'page_0', 'page_url']
  }

  classify (context, next) {
    const currentContext = context
    const currentEntries = context.contextEntries
    const entriesPerPage = this.settings.entriesPerPage
    const pageMax = Math.ceil(currentEntries.length / entriesPerPage)
    for (let i = 0; i < pageMax; i += 1) {
      context = _.cloneDeep(currentContext)
      context.page_max = pageMax
      context.page = i + 1
      context.page_0 = i
      context.page_url = i === 0 ? 'index' : i + 1
      context.contextEntries = currentEntries.slice(i * entriesPerPage, (i + 1) * entriesPerPage)
      next(context)
    }
  }
}
