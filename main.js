const _ = require('lodash')
const cheerio = require('cheerio')
const fs = require('fs')
const glob = require('glob')
const Handlebars = require('handlebars')
const path = require('path')

// src ディレクトリの設定
const src = 'src'

// base ディレクトリの設定
const base = 'src'

// 設定ファイルを読み込む
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf-8'))
settings.tags = new Map(settings.tags)
console.log(settings.tags)

// files テンプレートと対象ファイル群のマッピング
const files = {
  articles: {
    files: 'articles/**/*.html',
    template: '*.hbs'
  }
}

// files 繰り返す
for (const [name, file] of Object.entries(files)) {
  // glob
  glob(path.join(src, file.files), (err, matches) => {
    if (err) {
      throw err
    }

    const entries = []

    // 各ファイル 繰り返す
    matches.forEach(match => {
      const $ = cheerio.load(fs.readFileSync(match, 'utf-8'))

      const data = {}

      // タグを取得
      data.tags = $('meta[name="tag"]').map((i, el) => $(el).attr('content')).get()

      // カテゴリを取得
      data.category = $('meta[name="category"]').attr('content')

      // 日付を取得
      let date = $('meta[name="date"]').attr('content')
      if (date) {
        date = new Date(Date.parse(date))
      }
      data.date = date

      // タイトルを取得
      data.title = $('title').text()

      // 概要文を取得
      data.description = $('meta[name="description"]').attr('content')

      entries.push({
        file: match,
        data
      })
    })

    // インデックス作成の元データを作る

    // タグ別インデックス
    const tagsIndex = _.chain(entries)
      .map(entry => entry.data.tags)
      .flatten()
      .uniq()
      .sortBy(tag => [...settings.tags].findIndex(entry => entry[0] === tag))
      .map(tag => {
        return {
          tag: tag,
          'tag-url': settings.tags.has(tag) ? settings.tags.get(tag).url : tag,
          entries: entries.filter(entry => entry.data.tags.includes(tag))
        }
      })
      .value()

    // カテゴリ別インデックス
    // TODO

    // 月別インデックス
    // TODO

    // ページネーションの処理
    // TODO

    // インデックスファイルを生成する
    glob(path.join(src, file.template), (err, matches) => {
      const processedFiles = []

      matches.forEach(match => {
        const templateFile = path.join(src, match)
        const outputFile = path.basename(match, '.hbs') + '.html'
        const template = Handlebars.compile(fs.readFileSync(match, 'utf-8'))
        console.log(template({
          tags: tagsIndex
        }))
      })
    })
  })
}
