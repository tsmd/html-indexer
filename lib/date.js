const _ = require('lodash')
const Indexer = require('./indexer')
const moment = require('moment')

module.exports = class DateIndexer extends Indexer {
  constructor (settings) {
    super(_.defaults(settings, {
      utcOffset: '+09:00',
      locale: 'ja',
      formatDate: 'LL',
      additionalDates: [],
      selector: 'meta[name="date"]',
      useAttribute: true,
      attribute: 'content',
    }))
    this.exports = [
      'date',
      'date_str',
      'date_iso',
      'date_iso_full',
    ]
    this.settings.additionalDates.forEach(additionalDate => {
      this.exports.push(additionalDate.exports)
    })
    moment.locale(this.settings.locale)
  }

  retrieveData (entry, $) {
    const isoDate = this.settings.useAttribute
      ? $(this.settings.selector).eq(0).attr(this.settings.attribute)
      : $(this.settings.selector).eq(0).text()
    if (isoDate) {
      const date = new Date(Date.parse(isoDate))
      Object.assign(entry, {
        date: date,
        date_str: this.getDateString(date),
        date_iso: this.toISOString(date),
        date_iso_full: this.toISOFullString(date),
      })
      this.settings.additionalDates.forEach(additionalDate => {
        const {exports, format} = additionalDate
        entry[exports] = moment(date).utcOffset(this.settings.utcOffset).format(format)
      })
    }
  }

  addIndex (context) {
    context.dates = _.chain(context.entries)
      .filter(entry => Boolean(entry.date))
      .uniqBy('date_iso')
      .value()
  }

  classify (context, next) {
    const currentContext = context
    const currentEntries = context.contextEntries
    currentContext.dates.forEach(date => {
      context = _.cloneDeep(currentContext)
      Object.assign(context, _.pick(date, ['date', 'date_str', 'date_iso', 'date_iso_full']))
      context.contextEntries = currentEntries
        .filter(entry => Boolean(entry.date))
        .filter(entry => {
          return entry.date_str === date.date_str
        })
      next(context)
    })
  }

  getDateString (date) {
    return moment(date).utcOffset(this.settings.utcOffset).format(this.settings.formatDate)
  }

  toISOString (date) {
    const isoString = date.toISOString()
    return isoString.slice(0, isoString.indexOf('T'))
  }

  toISOFullString (date) {
    return date.toISOString()
  }
}
