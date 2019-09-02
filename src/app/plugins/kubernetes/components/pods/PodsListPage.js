import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { podActions } from 'k8s/components/pods/actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('Pods', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(podActions.list, params)
    return <div>
      <ClusterPicklist
        onChange={getParamsUpdater('clusterId')}
        value={params.clusterId}
        onlyMasterNodeClusters
      />
      <ListContainer
        loading={loading}
        reload={reload}
        data={data}
        getParamsUpdater={getParamsUpdater}
        {...pick(listTablePrefs, params)}
      />
    </div>
  }
}

export const options = {
  addUrl: '/ui/kubernetes/pods/add',
  addText: 'Add Pod',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  name: 'Pods',
  title: 'Pods',
  ListPage,
}
const components = createCRUDComponents(options)
export const PodsList = components.List

export default components.ListPage
