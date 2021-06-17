import React, { useMemo } from 'react'
import { listTablePrefs, allKey } from 'app/constants'
import { pick, prop, uniqBy } from 'ramda'
import { ImportedClusterSelector } from './model'
import PicklistComponent from 'core/components/Picklist'
import { importedClusterActions } from './actions'
import { IUseDataLoader } from '../nodes/model'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import useReactRouter from 'use-react-router'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
const Picklist: any = PicklistComponent

const columns = [
  { id: 'agentPoolName', label: 'Node Pool' },
  { id: 'name', label: 'Node Name' },
  { id: 'location', label: 'Location' },
  { id: 'sku.name', label: 'SKU' },
  { id: 'sku.tier', label: 'Tier' },
  { id: 'vmId', label: 'VM ID' },
]

const defaultParams = {
  agentPoolName: allKey,
}
const usePrefParams = createUsePrefParamsHook('DeployedApps', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const { match } = useReactRouter()
    const [clusters, loading, reload]: IUseDataLoader<ImportedClusterSelector> = useDataLoader(
      importedClusterActions.list,
    ) as any
    const cluster = clusters.find((x) => x.uuid === match.params.id)

    const {
      spec: {
        aks: { instances: nodes },
      },
    } = cluster

    const options = useMemo(
      () =>
        projectAs(
          { label: 'agentPoolName', value: 'agentPoolName' },
          uniqBy(prop('agentPoolName'), nodes),
        ),
      [nodes],
    )

    const filteredNodes = nodes.filter((node) => {
      if (params.agentPoolName === allKey) {
        return true
      } else {
        return params.agentPoolName === node.agentPoolName
      }
    })

    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={filteredNodes}
        getParamsUpdater={getParamsUpdater}
        filters={
          <>
            <Picklist
              label="Node Pool"
              onChange={getParamsUpdater('agentPoolName')}
              value={params.agentPoolName}
              options={options}
            />
          </>
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

export const options = {
  columns,
  uniqueIdentifier: 'vmId',
  multiSelection: false,
  name: 'AKSNodes',
  ListPage,
}

const components = createCRUDComponents(options)

export default components.ListPage
