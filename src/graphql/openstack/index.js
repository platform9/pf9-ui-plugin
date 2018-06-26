import { mergeSchemas } from 'graphql-tools'

import flavors from './schemas/flavors'
import networks from './schemas/networks'
import routers from './schemas/routers'
import volumes from './schemas/volumes'
import glanceImages from './schemas/glanceImages'
import userManagement from './schemas/userManagement'
import serviceCatalog from './schemas/serviceCatalog'

const mergedSchemas = mergeSchemas({
  schemas: [
    flavors,
    volumes,
    glanceImages,
    userManagement,
    networks,
    routers,
    serviceCatalog
  ]
})

export default mergedSchemas
