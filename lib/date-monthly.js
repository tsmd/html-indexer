const _ = require('lodash')
const Indexer = require('./indexer')

const dateMonthString = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `${year}年${month}月`
}

const dateMonthUrl = date => {
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  return `${year}-${month}`
}

module.exports = class DateMonthlyIndexer extends Indexer {
  constructor (settings) {
    super(settings)
    this.exports = ['month_date', 'month_str', 'month_url']
  }

  retrieveData (entry, $) {
    const isoDate = $('meta[name="date"]').attr('content')
    if (isoDate) {
      const date = new Date(Date.parse(isoDate))
      entry.date = {
        date: date,
        date_str: this.getDateString(date),
        date_iso: date.toISOString(),
        month_date: this.getMonth(date),
        month_str: this.getMonthString(date),
        month_url: this.getMonthUrl(date),
      }
    } else {
      entry.date = null
    }
  }

  addIndex (context) {
    context.months = _.chain(context.entries)
      .map(entry => ({
        month_str: dateMonthString(entry.date),
        month_url: dateMonthUrl(entry.date)
      }))
      .orderBy('month_url', 'desc')
      .sortedUniqBy('month_url')
      .value()
  }

  compare (a, b) {
    if (!a.date || !b.date) {
      return 0
    }
    return b.date.date.getTime() - a.date.date.getTime()
  }

  addIndex (context) {
    context.months = _.chain(context.entries)
      .filter(entry => Boolean(entry.date))
      .sortBy(entry => -entry.date.month_date.getTime())
      .sortedUniqBy(entry => entry.date.month_date.getTime())
      .map(entry => _.pick(entry.date, ['month_date', 'month_str', 'month_url']))
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
          const yearMonth = entry.date.month_date.getTime()
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
