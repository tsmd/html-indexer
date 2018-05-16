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
      const isFirst = i === 0
      const isLast = i === pageMax - 1
      context = _.cloneDeep(currentContext)
      context.page_max = pageMax
      context.page = i + 1
      context.page_0 = i
      context.page_url = i === 0 ? 'index' : i + 1
      context.is_first = isFirst
      context.is_last = isLast
      if (!isFirst) {
        context.prev = i
        context.prev_0 = i - 1
        context.prev_url = i - 1 === 0 ? 'index' : i
      }
      if (!isLast) {
        context.next = i + 2
        context.next_0 = i + 1
        context.next_url = i + 2
      }
      context.pages_5 = this.getPages(i + 1, pageMax, 5)
      context.pages_3 = this.getPages(i + 1, pageMax, 3)
      context.contextEntries = currentEntries.slice(i * entriesPerPage, (i + 1) * entriesPerPage)
      next(context)
    }
  }

  getPages(current, total, itemSize = 5) {
    const pages = []
    let start = 1
    let stop = total
    if (itemSize < total) {
      start = Math.max(current - Math.ceil(itemSize / 2) + 1, 1)
      stop = start + itemSize - 1
      if (stop > total) {
        stop = total
        start = stop - itemSize + 1
      }
    }
    for (let i = start; i <= stop; i += 1) {
      pages.push({
        page: i,
        page_0: i - 1,
        page_url: i === 1 ? 'index' : i,
        is_current: i === current
      })
    }
    return pages
  }
}
