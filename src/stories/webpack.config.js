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
      // IDE's seem to solve paths according to the order in which they are defined
      // so we must put first the more specific aliases
      developer: path.resolve(__dirname, '../app/plugins/developer'),
      k8s: path.resolve(__dirname, '../app/plugins/kubernetes'),
      openstack: path.resolve(__dirname, '../app/plugins/openstack'),
      core: path.resolve(__dirname, '../app/core'),
      utils: path.resolve(__dirname, '../app/utils'),
      app: path.resolve(__dirname, '../app'),
    },
    extensions: ['.webpack.js', '.web.js', '.js', '.json', '.css'],
  }
}
