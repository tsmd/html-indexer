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

    // 各ファイル 繰り返す
    matches.forEach(match => {
      const html = fs.readFileSync(match, 'utf-8')
      console.log(html)

      // タグを取得

      // カテゴリを取得

      // 日付を取得

      // タイトルを取得

      // 概要文を取得

    })
  })

}
