const path = require('path')

const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const contextPath = path.resolve(__dirname, './src/app')
const outputPath = path.resolve(__dirname, './build')

const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'
const isProd = env === 'production'

const plugins = [
  new CopyWebpackPlugin([{ from: './static' }])
]

const appEntry = []

// dev only stuff
if (isDev) {
  appEntry.push('react-hot-loader/patch')
  appEntry.push('webpack-hot-middleware/client')
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  )
}

if (isProd) {
  plugins.push(new UglifyJSPlugin({ sourceMap: true }))
}

plugins.push(new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(env)
}))

// main entry point
appEntry.push('babel-polyfill')
appEntry.push('./index.js')

module.exports = {
  entry: {
    app: appEntry,
  },
  devtool: isProd ? 'source-map' : 'inline-source-map',
  output: {
    filename: '[name]-bundle.js',
    publicPath: '/',
    path: outputPath,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.graphql$/,
        exclude: /node_modules/,
        use: 'graphql-tag/loader'
      },
    ]
  },
  context: contextPath,
  plugins,
  resolve: {
    alias: {
      core: path.resolve(__dirname, 'src/app/core'),
      openstack: path.resolve(__dirname, 'src/app/plugins/openstack'),
      k8s: path.resolve(__dirname, 'src/app/plugins/kubernetes'),
      sim: path.resolve(__dirname, 'src/openstack-simulator'),
      schema: path.resolve(__dirname, 'src/graphql')
    }
  }
}
