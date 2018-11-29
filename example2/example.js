const indexer = require('../html-indexer')

const targetSettings = [
  {
    src: 'src',
    entries: ['events/2018-*/*/index.html'],
    templates: ['events/**/*.ejs'],
    indexers: [
      ['attribute-value', {
        selector: 'meta[name="time"]',
        name: 'content',
        exports: 'time'
      }],
      ['attribute-value', {
        selector: 'meta[name="organiser"]',
        name: 'content',
        exports: 'organiser'
      }],
      ['date', {
        locale: 'en',
        formatDate: 'YYYY.MM.DD',
        additionalDates: [
          {exports: 'year', format: 'YYYY'},
          {exports: 'month_2', format: 'MM'},
          {exports: 'date_2', format: 'DD'},
          {exports: 'day_abbr', format: 'ddd'},
        ]
      }],
      ['tag', {
        tags: [
          ['Hoge', {
            url: 'tag-1'
          }],
          ['Fuga', {
            url: 'tag-2'
          }]
        ]
      }],
      ['title', {}]
    ],
    orderBy: 'date',
    order: 'asc'
  }
]

targetSettings.forEach(targetSetting => {
  indexer.exec(targetSetting)
})
