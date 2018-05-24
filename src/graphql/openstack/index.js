import { mergeSchemas } from 'graphql-tools'

import flavors from './schemas/flavors'
import userManagement from './schemas/userManagement'
import serviceCatalog from './schemas/serviceCatalog'

const mergedSchemas = mergeSchemas({
  schemas: [
    flavors,
    userManagement,
    serviceCatalog
  ]
})

export default mergedSchemas
