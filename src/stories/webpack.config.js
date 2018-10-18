// Storybook uses its own webpack.config.js that is independent of our
// main config.  It does provide a mechanism to extend it.
// Aliases have been added so we don't have to figure out the relative paths.

const path = require('path')
const includePath = path.resolve(__dirname, '../app')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        include: includePath,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
    ],
  },
  resolve: {
    alias: {
      app: path.resolve(__dirname, '../app'),
      core: path.resolve(__dirname, '../app/core'),
      openstack: path.resolve(__dirname, '../app/plugins/openstack'),
      kubernetes: path.resolve(__dirname, '../app/plugins/kubernetes'),
      util: path.resolve(__dirname, '../app/util'),
    },
    extensions: ['.webpack.js', '.web.js', '.js', '.json', '.css'],
  }
}
