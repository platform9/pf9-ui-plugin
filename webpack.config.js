const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
process.traceDeprecation = true
const contextPath = path.resolve(__dirname, './src/app')
const outputPath = path.resolve(__dirname, './build')

const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'
const isProd = env === 'production'

console.log(env)

const extractCSS = new MiniCssExtractPlugin({
  // Options similar to the same options in webpackOptions.output
  // both options are optional
  filename: isProd ? '[name].[hash].styles.css' : '[name].styles.css',
  chunkFilename: isProd ? '[id].[hash].styles.css' : '[id].styles.css',
})

const appEntry = []

// dev only stuff
if (isDev) {
  appEntry.push('react-hot-loader/patch')
}

// main entry point
appEntry.push('@babel/polyfill')
appEntry.push('./index.js')

module.exports = {
  entry: {
    app: appEntry,
  },
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
  devServer: {
    contentBase: outputPath,
    port: 3000,
    compress: true,
    hot: true,
    open: true,
    historyApiFallback: true
  },
  output: {
    filename: isDev ? '[name]-bundle.js' : '[name].[hash]-bundle.js',
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
  optimization: {
    runtimeChunk: 'single',
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      })
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    ...(isProd
      ? [new CleanWebpackPlugin(['build'])]
      : [new webpack.NamedModulesPlugin()]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    extractCSS,
    new HtmlWebpackPlugin({
      inject: true,
      template: './static/ui/index.html',
      favicon: './static/favicon.ico',
      title: 'Caching'
    }),
    new webpack.HashedModuleIdsPlugin(),
    new CopyWebpackPlugin([{ from: './static' }], {
      copyUnmodified: false
    })
  ],
  resolve: {
    alias: {
      // IDE's seem to solve paths according to the order in which they are defined
      // so we must put first the more specific aliases
      developer: path.resolve(__dirname, 'src/app/plugins/developer'),
      k8s: path.resolve(__dirname, 'src/app/plugins/kubernetes'),
      openstack: path.resolve(__dirname, 'src/app/plugins/openstack'),
      core: path.resolve(__dirname, 'src/app/core'),
      utils: path.resolve(__dirname, 'src/app/utils'),
      app: path.resolve(__dirname, 'src/app'),
      server: path.resolve(__dirname, 'src/server'),
      'api-client': path.resolve(__dirname, 'src/api-client'),
    },
  }
}
