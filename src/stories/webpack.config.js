// Storybook uses its own webpack.config.js that is independent of our
// main config.  It does provide a mechanism to extend it.
// Aliases have been added so we don't have to figure out the relative paths.

const R = require('ramda')
const baseConfig = require('../../webpack.config.js')

module.exports = async ({ config, mode }) => {
  config.resolve = R.mergeDeepRight(config.resolve || {}, baseConfig.resolve)

  // Return the altered config
  return config
}
