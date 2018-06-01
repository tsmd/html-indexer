const indexer = require('../html-indexer')

const targetSettings = [
  {
    src: 'src',
    entries: ['articles/**/*.html'],
    templates: ['categories/**/*.ejs', '*.ejs'],
    indexers: [
      ['category', {
        categories: [
          ['Category 1', {
            url: 'category-1'
          }],
          ['Category 2', {
            url: 'category-2'
          }]
        ]
      }],
      ['date-monthly', {}],
      ['description', {}],
      ['page', {
        entriesPerPage: 2
      }],
      ['title', {}]
    ],
    orderBy: 'month_url',
    order: 'desc'
  },
  {
    src: 'src',
    entries: ['events/events/**/*.html'],
    templates: ['events/**/*.ejs'],
    indexers: [
      ['date-monthly', {
        locale: 'en',
        formatMonth: 'MMMM, Y'
      }],
      ['description', {}],
      ['page', {
        entriesPerPage: 2
      }],
      ['tag', {
        tags: [
          ['Tag 1', {
            url: 'tag-1'
          }],
          ['Tag 2', {
            url: 'tag-2'
          }],
          ['Tag 3', {
            url: 'tag-3'
          }]
        ]
      }],
      ['title', {}]
    ],
    orderBy: 'month_url',
    order: 'desc'
  },
  {
    src: 'src',
    entries: ['stories/stories/**/*.html'],
    templates: ['stories/**/*.ejs'],
    indexers: [
      ['category', {
        categories: [
          ['Category 1', {
            url: 'category-1'
          }],
          ['Category 2', {
            url: 'category-2'
          }]
        ]
      }],
      ['date-monthly', {}],
      ['inner-html', {
        selector: 'main',
        exports: 'main',
      }],
      ['page', {
        entriesPerPage: 2
      }]
    ],
    orderBy: 'month_url',
    order: 'desc'
  }
]

targetSettings.forEach(targetSetting => {
  indexer.exec(targetSetting)
})
