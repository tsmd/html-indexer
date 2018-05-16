const _ = require('lodash')
const cheerio = require('cheerio')
const fs = require('fs')
const glob = require('fast-glob')
const Handlebars = require('handlebars')
const ejs = require('ejs')
const mkdirp = require('mkdirp')
const path = require('path')

const TagIndexer = require('./lib/tag')
const CategoryIndexer = require('./lib/category')
const PageIndexer = require('./lib/page')
const DateIndexer = require('./lib/date')
const TitleIndexer = require('./lib/title')
const DescriptionIndexer = require('./lib/description')

// 設定ファイルを読み込む
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf-8'))

const forwardSlash = path => path.replace(/\\/g, '/')

const indexers = [
  new TagIndexer(settings),
  new CategoryIndexer(settings),
  new PageIndexer(settings),
  new DateIndexer(settings),
  new TitleIndexer(settings),
  new DescriptionIndexer(settings),
]

const retrieveEntry = (entryFile) => {
  const $ = cheerio.load(fs.readFileSync(entryFile, 'utf-8'))
  const entry = {
    file: forwardSlash(path.relative(settings.base, entryFile)),
  }
  indexers.forEach(plugin => {
    plugin.retrieveData(entry, $)
  })
  return entry
}

const extractProcessStack = (filePath) => {
  const matched = filePath.match(/{{.+?}}/g)
  return matched ? matched.map(tag => tag.slice(2, tag.length - 2)) : []
}

const processNext = (stack, data, templateFile) => {
  const process = stack[0]
  const nextStack = stack.slice(1)
  if (process) {
    indexers.forEach(plugin => {
      if (plugin.exports.includes(process)) {
        plugin.classify(data, nextContext => processNext(nextStack, nextContext, templateFile))
      }
    })
  } else {
    render(templateFile, data)
  }
}

const processedFiles = []
const render = (file, data) => {
  const translatedFile = forwardSlash(path.join(settings.src, path.relative(settings.templateSrc, file)))
  const baseFilename = Handlebars.compile(translatedFile)(data) // Handlebars つかいたくない
  const outputFile = path.dirname(baseFilename) + '/' + path.basename(baseFilename, '.ejs') + '.html'
  if (!processedFiles.includes(outputFile)) {
    processedFiles.push(outputFile)
    const template = ejs.compile(fs.readFileSync(file, 'utf-8'))
    mkdirp.sync(path.dirname(outputFile))
    fs.writeFileSync(outputFile, template(data))
  }
}

Object.values(settings.files).forEach(file => {
  const entryFiles = glob.sync(path.join(settings.src, file.entries))
  const templateFiles = glob.sync(path.join(settings.templateSrc, file.templates))

  const entries = entryFiles.map(retrieveEntry)

  const context = {
    entries,
    contextEntries: _.cloneDeep(entries)
  }

  indexers.forEach(plugin => {
    plugin.addIndex(context)
  })

  templateFiles.forEach(templateFile => {
    const processStack = extractProcessStack(templateFile)
    const clonedContext = _.cloneDeep(context)
    processNext(processStack, clonedContext, templateFile)
  })
})
