const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class TagIndexer extends Indexer {
  constructor (settings) {
    super(settings)
    this.exports = ['tag', 'tag_url']
    settings.tags = new Map(settings.tags)
  }

  retrieveData (entry, $) {
    entry.tags = $('meta[name="tag"]').map((i, el) => {
      const tag = $(el).attr('content').trim()
      return {
        tag: tag,
        tag_url: this.settings.tags.has(tag) ? this.settings.tags.get(tag).url : tag,
      }
    }).get()
  }

  addIndex (context) {
    context.tags = _.chain(context.entries)
      .map(entry => entry.tags)
      .flatten()
      .uniqBy('tag')
      .sortBy(tag => [...this.settings.tags].findIndex(entry => entry[0] === tag.tag))
      .value()
  }

  classify (context, next) {
    const currentContext = context
    const currentEntries = context.contextEntries
    currentContext.tags.forEach(tag => {
      context = _.cloneDeep(currentContext)
      context.tag = tag.tag
      context.tag_url = tag.tag_url
      context.contextEntries = currentEntries.filter(entry => entry.tags.findIndex(_tag => _tag.tag === tag.tag) >= 0)
      next(context)
    })
  }
}
