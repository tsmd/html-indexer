const _ = require('lodash')
const cheerio = require('cheerio')
const ejs = require('ejs')
const fs = require('fs')
const glob = require('fast-glob')
const mkdirp = require('mkdirp')
const path = require('path')

function normalizeToForwardSlash (path) {
  return path.replace(/\\/g, '/')
}

function render (file, data) {
  return ejs.compile(fs.readFileSync(file, 'utf-8'))(data)
}

function writeFile (filePath, data) {
  mkdirp.sync(path.dirname(filePath))
  fs.writeFileSync(filePath, data, 'utf-8')
}

function extractIndexStack (filePath) {
  const matched = filePath.match(/{{.+?}}/g)
  return matched ? matched.map(tag => tag.slice(2, tag.length - 2)) : []
}

function resolvePath (path_) {
  return path.join(srcDir, path_)
}

function replaceBraces (stringWithBraces, data) {
  const regExp = /{{\S+?}}/
  let match
  while (match = regExp.exec(stringWithBraces)) {
    const matched = match[0]
    stringWithBraces = stringWithBraces.replace(matched, data[matched.slice(2, -2)])
    regExp.lastIndex = match.index
  }
  return stringWithBraces
}

const settings = JSON.parse(fs.readFileSync('settings.json', 'utf-8'))
const srcDir = settings.src

Object.values(settings.targets).forEach(target => {

  function instantiateIndexers ([indexer, options]) {
    const Indexer = require(`./lib/${indexer}`)
    if (!Indexer) {
      throw Error(`Indexer ${indexer} not found.`)
    }
    return new Indexer(options)
  }

  function retrieveEntry (entryFile) {
    const $ = cheerio.load(fs.readFileSync(entryFile, 'utf-8'))
    const entry = {
      file: normalizeToForwardSlash(path.relative(srcDir, entryFile)),
    }
    indexers.forEach(plugin => {
      plugin.retrieveData(entry, $)
    })
    return entry
  }

  function indexNext (stack, data, templateFile) {
    const process = stack[0]
    const nextStack = stack.slice(1)
    if (process) {
      indexers.forEach(plugin => {
        if (plugin.exports.includes(process)) {
          plugin.classify(data, nextContext => indexNext(nextStack, nextContext, templateFile))
        }
      })
    } else {
      const outputFile = replaceBraces(templateFile, data).replace(/\.ejs$/i, '.html')
      const rendered = render(templateFile, data)
      writeFile(outputFile, rendered)
    }
  }

  const indexers = target.indexers.map(instantiateIndexers)
  const entryPattern = target.entries.map(resolvePath)
  const entryFiles = glob.sync(entryPattern)
  const entries = entryFiles.map(retrieveEntry)
  const sortedEntries = target.orderBy ? _.orderBy(entries, target.orderBy, target.order) : entries

  const context = {
    entries: sortedEntries,
    contextEntries: _.cloneDeep(sortedEntries)
  }

  indexers.forEach(plugin => {
    plugin.addIndex(context)
  })

  const templatePattern = target.templates.map(resolvePath)
  const templateFiles = glob.sync(templatePattern)

  templateFiles.forEach(templateFile => {
    const indexStack = extractIndexStack(templateFile)
    const clonedContext = _.cloneDeep(context)
    indexNext(indexStack, clonedContext, templateFile)
  })
})
