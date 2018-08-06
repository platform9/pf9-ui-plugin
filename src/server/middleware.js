import context from './context'
import config from '../../config'

export const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
}

export const tokenValidator = (req, res, next) => {
  const authToken = req.headers['x-auth-token']

  // Simulator version
  const fullToken = context.validateToken(authToken)
  if (!fullToken) {
    return res.status(401).send('Not authorized')
  }
  req.token = fullToken
  next()
}

// The OpenStack API client needs the X-Auth-Token from the request
// and which region to use (from config.js) for the service catalog.
export const injectClientInfo = (req, res, next) => {
  const authToken = req.headers['x-auth-token']
  if (context.client) {
    context.client.unscopedToken = authToken
    context.client.scopedToken = authToken
    if (config.region) {
      context.client.setActiveRegion(config.region)
    }
  }
  next()
}

export const enableAllCors = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'OPTION,GET,PUT,POST,DELETE,PATCH')
  res.set('Access-Control-Allow-Headers', 'Content-Type,X-Auth-Token')
  res.set('Access-Control-Expose-Headers', 'Content-Type,X-Subject-Token')
  next()
}
