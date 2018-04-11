const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class CategoryIndexer extends Indexer {
  constructor (settings) {
    super(settings)
    this.exports = ['category', 'category_url']
    settings.categories = new Map(settings.categories)
  }

  retrieveData (entry, $) {
    const category = $('meta[name="category"]').attr('content')
    entry.category = {
      category: category,
      category_url: this.settings.categories.has(category) ? this.settings.categories.get(category).url : category,
    }
  }

  addIndex (context) {
    context.categories = _.chain(context.entries)
      .map(entry => entry.category)
      .filter(category => Boolean(category.category))
      .uniqBy('category')
      .sortBy(category => [...this.settings.categories].findIndex(entry => entry[0] === category.category))
      .value()
  }

  classify (context, next) {
    const currentContext = context
    const currentEntries = context.contextEntries
    currentContext.categories.forEach(category => {
      context = _.cloneDeep(currentContext)
      context.category = category.category
      context.category_url = category.category_url
      context.contextEntries = currentEntries.filter(entry => entry.category.category === category.category)
      next(context)
    })
  }
}
