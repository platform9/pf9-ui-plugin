import { mergeSchemas } from 'graphql-tools'

import flavors from './schemas/flavors'
import volumes from './schemas/volumes'
import images from './schemas/images'
import userManagement from './schemas/userManagement'
import serviceCatalog from './schemas/serviceCatalog'

const mergedSchemas = mergeSchemas({
  schemas: [
    flavors,
    volumes,
    images,
    userManagement,
    serviceCatalog
  ]
})

export default mergedSchemas
