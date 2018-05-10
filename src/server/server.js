import express from 'express'
import http from 'http'
import path from 'path'

const app = express()
const port = process.env.PORT || 3000

console.log('Starting server')

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

const nodeEnv = process.env.NODE_ENV || 'development'
const isDev = nodeEnv === 'development'

let webpackDevMiddleware

if (isDev) {
  console.log('Webpack processing...')
  const webpack = require('webpack')
  const webpackConfig = require('../../webpack.config')
  const compiler = webpack(webpackConfig)

  webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    index: 'static/ui/index.html',
    hot: true,
    noInfo: true,
    stats: {
      colors: true
    }
  })
  const webpackHotMiddleware = require('webpack-hot-middleware')(compiler)

  app.use(webpackDevMiddleware)
  app.use(webpackHotMiddleware)
}

app.all('*', (req, res) => {
  res.write(webpackDevMiddleware.fileSystem.readFileSync(path.join(__dirname, '..', '..', 'build', 'ui', 'index.html')))
  res.end()
})

const server = http.createServer(app)
server.listen(port)
console.log(`Server listening on port ${port}`)
