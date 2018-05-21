import Token from './models/Token'

export const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
}

export const tokenValidator = (req, res, next) => {
  const authToken = req.headers['x-auth-token']
  const fullToken = Token.validateToken(authToken)
  if (!fullToken) {
    return res.status(401).send('Not authorized')
  }
  req.token = fullToken
  next()
}

export const enableAllCors = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'OPTION,GET,PUT,POST,DELETE,PATCH')
  res.set('Access-Control-Allow-Headers', 'Content-Type,X-Auth-Token')
  res.set('Access-Control-Expose-Headers', 'Content-Type,X-Subject-Token')
  next()
}
