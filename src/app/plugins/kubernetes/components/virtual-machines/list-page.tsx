import React, { useCallback } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { pick } from 'ramda'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
// import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import { routes } from 'core/utils/routes'
// import { trackEvent } from 'utils/tracking'
// import SimpleLink from 'core/components/SimpleLink'
import { virtualMachineActions } from './actions'

const defaultParams = {
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('Pods', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(virtualMachineActions.list, params)
    const updateClusterId = useCallback((clusterId) => {
      updateParams({
        clusterId,
        namespace: allKey,
      })
    }, [])
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={data}
        getParamsUpdater={getParamsUpdater}
        filters={
          <>
            <ClusterPicklist
              // @ts-ignore
              selectFirst={false}
              onChange={updateClusterId}
              value={params.clusterId}
              onlyMasterNodeClusters
            />
            <NamespacePicklist
              // @ts-ignore
              selectFirst={false}
              onChange={getParamsUpdater('namespace')}
              value={params.namespace}
              clusterId={params.clusterId}
              disabled={!params.clusterId}
            />
          </>
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

export const options = {
  // deleteFn: podActions.delete,
  addUrl: routes.virtualMachines.add.path(),
  addText: 'Add Virtual Machine',
  columns: [
    { id: 'name', label: 'Name' },
    // { id: 'clusterName', label: 'Cluster' },
    // { id: 'namespace', label: 'Namespace' },
    // { id: 'labels', label: 'Labels', render: renderLabels('label') },
    // { id: 'containers', label: 'Containers', render: renderContainers },
    // { id: 'status.phase', label: 'Status', render: renderStatus },
    // { id: 'status.hostIP', label: 'Node IP' },
    // {
    //   id: 'created',
    //   label: 'Age',
    //   render: (value) => <DateAndTime value={value} />,
    // },
  ],
  name: 'Virtual Machines',
  title: 'Virtual Machines',
  ListPage,
}
const components = createCRUDComponents(options)
export const VirtualMachinesList = components.List

export default components.ListPage
