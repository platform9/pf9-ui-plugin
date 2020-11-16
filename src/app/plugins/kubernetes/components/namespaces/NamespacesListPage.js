import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import namespaceActions from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { pick } from 'ramda'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import DateCell from 'core/components/listTable/cells/DateCell'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('Namespaces', listTablePrefs)

const canDeleteNameSpace = ([namespace]) => namespace.status !== 'Terminating'

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [namespaces, loading, reload] = useDataLoader(namespaceActions.list, params)
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={namespaces}
        getParamsUpdater={getParamsUpdater}
        filters={
          <ClusterPicklist
            selectFirst={false}
            onChange={getParamsUpdater('clusterId')}
            value={params.clusterId}
            onlyMasterNodeClusters
          />
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

export const options = {
  addUrl: '/ui/kubernetes/pods/namespaces/add',
  addText: 'Add Namespace',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'status', label: 'Status' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created', render: (value) => <DateCell value={value} /> },
  ],
  loaderFn: namespaceActions.list,
  deleteFn: namespaceActions.delete,
  deleteCond: canDeleteNameSpace,
  name: 'Namespaces',
  title: 'Namespaces',
  ListPage,
}

const components = createCRUDComponents(options)
export const NodesList = components.List

export default components.ListPage
