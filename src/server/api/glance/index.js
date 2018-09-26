import express from 'express'

// Images
import getImages from './getImages'
import deleteImage from './deleteImage'
import patchImage from './patchImage'

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2/images', tokenValidator, getImages)
router.delete('/v2/images/:imageId', tokenValidator, deleteImage)
router.patch('/v2/images/:imageId', tokenValidator, patchImage)

export default router
