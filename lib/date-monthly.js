const _ = require('lodash')
const Indexer = require('./indexer')

module.exports = class DateMonthlyIndexer extends Indexer {
  constructor (settings) {
    super(settings)
    this.exports = [
      'date',
      'date_str',
      'date_iso',
      'month_date',
      'month_str',
      'month_url',
    ]
  }

  retrieveData (entry, $) {
    const isoDate = $('meta[name="date"]').attr('content')
    if (isoDate) {
      const date = new Date(Date.parse(isoDate))
      Object.assign(entry, {
        date      : date,
        date_str  : this.getDateString(date),
        date_iso  : this.toISOString(date),
        month_date: this.getMonth(date),
        month_str : this.getMonthString(date),
        month_url : this.getMonthUrl(date),
      })
    }
  }

  addIndex (context) {
    context.months = _.chain(context.entries)
      .filter(entry => Boolean(entry.date))
      .sortBy(entry => -entry.date.getTime())
      .sortedUniqBy(entry => entry.month_date.getTime())
      .map(entry => _.pick(entry, ['month_date', 'month_str', 'month_url']))
      .value()
  }

  classify (context, next) {
    const currentContext = context
    const currentEntries = context.contextEntries
    currentContext.months.forEach(month => {
      context = _.cloneDeep(currentContext)
      Object.assign(context, month)
      context.contextEntries = currentEntries
        .filter(entry => Boolean(entry.date))
        .filter(entry => {
          const yearMonth = entry.month_date.getTime()
          return yearMonth === month.month_date.getTime()
        })
      next(context)
    })
  }

  getDateString (date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  }

  toISOString (date) {
    const isoString = date.toISOString()
    return isoString.slice(0, isoString.indexOf('T'))
  }

  getMonth (date) {
    return new Date(date.getFullYear(), date.getMonth())
  }

  getMonthString (date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return `${year}年${month}月`
  }

  getMonthUrl (date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return `${year}-${('0' + month).slice(-2)}`
  }
}
