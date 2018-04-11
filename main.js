const cheerio = require('cheerio')
const fs = require('fs')
const glob = require('glob')
const path = require('path')

// src ディレクトリの設定
const src = 'src'

// base ディレクトリの設定
const base = 'src'

// files テンプレートと対象ファイル群のマッピング
const files = {
  articles: {
    template: '*.hbs',
    files: 'articles/**/*.html'
  }
}

// files 繰り返す
for (const [name, file] of Object.entries(files)) {
  // glob
  glob(path.join('src', file.files), (err, matches) => {
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

    console.log(entries)
  })
}
