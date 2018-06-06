var defaultSettings = {
  branch: 'release',
  version: null,
  dev: false
}

var bucketPrefix = 'https://s3-us-west-1.amazonaws.com/pf9-ui/'
var bundleFilename = 'app-bundle.js'
var localStorageKey = 'pf9-loader'

function getQueryParams () {
  var search = new URLSearchParams(location.search)
  var branch = search.get('branch')
  var version = search.get('version')
  var dev = search.get('dev')
  if (!branch && !version && !dev) {
    return null
  }
  var params = {
    branch: branch,
    version: version,
    dev: dev === 'true'
  }
  return params
}

function getSavedSettings (params) {
  var saved = window.localStorage.getItem(localStorageKey)
  return saved ? JSON.parse(saved) : null
}

function mergeSettings (query, saved, defaults) {
  return query || saved || defaults
}

function determineLoadPath (settings) {
  if (settings.dev) {
    return '/' + bundleFilename
  }

  var folder = settings.version || settings.branch
  return bucketPrefix + folder + '/' + bundleFilename
}

function saveSettings (mergedSettings) {
  window.localStorage.setItem(localStorageKey, JSON.stringify(mergedSettings))
}

function loadBundle (path) {
  console.log('Loading javascript asset bundle from: ' + path)
  var script = document.createElement('script')
  script.src = path
  document.write(script.outerHTML)
}

function load () {
  var queryParams = getQueryParams()
  var savedSettings = getSavedSettings()
  var merged = mergeSettings(queryParams, savedSettings, defaultSettings)
  saveSettings(queryParams || merged)
  var loadPath = determineLoadPath(merged)
  loadBundle(loadPath)
}

load()
