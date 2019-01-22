// Storybook uses its own webpack.config.js that is independent of our
// main config.  It does provide a mechanism to extend it.
// Aliases have been added so we don't have to figure out the relative paths.

const R = require('ramda')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('../../webpack.config.js')

module.exports = merge(
  R.pick(['module', 'resolve'], baseConfig),
  {
    devtool: 'cheap-module-eval-source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': 'development'
      })
    ]
  })
