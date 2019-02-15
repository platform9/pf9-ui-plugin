import express from 'express'
import context from '../../context'

const resetContext = (req, res) => {
  console.log('---ADMIN--- resetContext')
  context.resetContext()
  res.sendStatus(200)
}

const loadPreset = (req, res) => {
  const { preset } = req.params
  console.log(`---ADMIN--- loadPreset (${preset})`)
  context.resetContext()
  const loaderPreset = require(`../../presets/${preset}.js`).default
  loaderPreset && loaderPreset()
  context.createSimUser()
  res.sendStatus(200)
}

const router = express.Router()

router.get('/reset-context', resetContext)
router.get('/preset/:preset', loadPreset)

export default router
