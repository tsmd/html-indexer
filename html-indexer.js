const _ = require('lodash')
const cheerio = require('cheerio')
const ejs = require('ejs')
const fs = require('fs')
const glob = require('fast-glob')
const mkdirp = require('mkdirp')
const path = require('path')

module.exports = {
  exec,
}

function exec (settings) {
  function resolvePath (path_) {
    return path.join(settings.src, path_)
  }

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
      file: normalizeToForwardSlash(path.relative(settings.src, entryFile)),
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
      const rendered = renderFile(templateFile, data)
      writeFile(outputFile, rendered)
    }
  }

  const indexers = settings.indexers.map(instantiateIndexers)
  const entryPattern = settings.entries.map(resolvePath)
  const entryFiles = glob.sync(entryPattern)
  const entries = entryFiles.map(retrieveEntry)
  const sortedEntries = settings.orderBy ? _.orderBy(entries, settings.orderBy, settings.order) : entries

  const context = {
    entries: sortedEntries,
    contextEntries: _.cloneDeep(sortedEntries)
  }

  indexers.forEach(plugin => {
    plugin.addIndex(context)
  })

  const templatePattern = settings.templates.map(resolvePath)
  const templateFiles = glob.sync(templatePattern)

  templateFiles.forEach(templateFile => {
    const indexStack = extractIndexStack(templateFile)
    const clonedContext = _.cloneDeep(context)
    indexNext(indexStack, clonedContext, templateFile)
  })
}

function normalizeToForwardSlash (path) {
  return path.replace(/\\/g, '/')
}

function renderFile (file, data) {
  const fileContent = fs.readFileSync(file, 'utf-8')
  return render(fileContent, data)
}

function render (file, data) {
  return ejs.compile(file)(data)
}

function writeFile (filePath, data) {
  mkdirp.sync(path.dirname(filePath))
  fs.writeFileSync(filePath, data, 'utf-8')
}

function extractIndexStack (filePath) {
  const matched = filePath.match(/{{.+?}}/g)
  return matched ? matched.map(tag => tag.slice(2, tag.length - 2)) : []
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
