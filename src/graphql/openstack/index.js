import { mergeSchemas } from 'graphql-tools'

import flavors from './schemas/flavors'
import networks from './schemas/networks'
import routers from './schemas/routers'
import floatingIps from './schemas/floatingIps'
import volumes from './schemas/volumes'
import glanceImages from './schemas/glanceImages'
import userManagement from './schemas/userManagement'
import serviceCatalog from './schemas/serviceCatalog'
import applications from './schemas/applications'
import sshKeys from './schemas/sshKeys'

const mergedSchemas = mergeSchemas({
  schemas: [
    flavors,
    volumes,
    glanceImages,
    userManagement,
    networks,
    routers,
    floatingIps,
    serviceCatalog,
    applications,
    sshKeys
  ]
})

export default mergedSchemas
