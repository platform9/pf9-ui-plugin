import React, { useMemo } from 'react'
import { listTablePrefs, allKey } from 'app/constants'
import { flatten, map, pick, pipe, prop, uniqBy } from 'ramda'
import PicklistComponent from 'core/components/Picklist'
import { importedClusterActions } from './actions'
import { IUseDataLoader } from '../nodes/model'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import useReactRouter from 'use-react-router'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { NodePool } from './model'
const Picklist: any = PicklistComponent

const columns = [
  { id: 'groupName', label: 'Node Group' },
  { id: 'name', label: 'Node Name' },
  { id: 'location', label: 'Location' },
  { id: 'instanceTemplate', label: 'Instance Template' },
]

const defaultParams = {
  groupName: allKey,
}
const usePrefParams = createUsePrefParamsHook('GkeNodes', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const { match } = useReactRouter()
    const [clusters, loading, reload]: IUseDataLoader<any> = useDataLoader(
      importedClusterActions.list,
    ) as any
    const cluster = clusters.find((x) => x.uuid === match.params.id)

    const { nodeGroups } = cluster
    const nodes = pipe(
      map((nodeGroup: NodePool) =>
        nodeGroup?.instances?.map((instance) => ({
          ...instance,
          groupName: nodeGroup?.name,
        })),
      ),
      flatten,
    )(nodeGroups)

    const options = useMemo(
      () => projectAs({ label: 'groupName', value: 'groupName' }, uniqBy(prop('groupName'), nodes)),
      [nodeGroups],
    )
    const filteredNodes = nodes.filter((node) => {
      if (params.groupName === allKey) {
        return true
      } else {
        return params.groupName === node.groupName
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
              label="Node Group"
              onChange={getParamsUpdater('groupName')}
              value={params.groupName}
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
  uniqueIdentifier: 'id',
  multiSelection: false,
  ListPage,
}

const components = createCRUDComponents(options)

export default components.ListPage
