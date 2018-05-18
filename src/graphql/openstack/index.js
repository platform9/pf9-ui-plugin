import { mergeSchemas } from 'graphql-tools'

import flavors from './schemas/flavors'
import userManagement from './schemas/userManagement'

const mergedSchemas = mergeSchemas({
  schemas: [
    flavors,
    userManagement,
  ]
})

export default mergedSchemas
