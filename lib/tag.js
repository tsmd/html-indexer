const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class TagIndexer extends Indexer {
  constructor (settings) {
    super(_.defaults(settings, {
      selector: 'meta[name="tag"]',
      useAttribute: true,
      attribute: 'content',
    }))
    this.exports = ['tag', 'tag_url']
    settings.tags = new Map(settings.tags)
  }

  retrieveData (entry, $) {
    entry.tags = $(this.settings.selector).map((i, el) => {
      const tag = this.settings.useAttribute
        ? $(el).attr(this.settings.attribute)
        : $(el).text()
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
