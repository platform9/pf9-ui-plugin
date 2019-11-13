import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import namespaceActions from './actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs } from 'app/constants'
import { pick } from 'ramda'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'

const defaultParams = {
  masterNodeClusters: true
}
const usePrefParams = createUsePrefParamsHook('Namespaces', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [namespaces, loading, reload] = useDataLoader(
      namespaceActions.list,
      params
    )
    return (
      <PageContainer floatingHeader={false}>
        <Tabs>
          <Tab value="namespace" label="Namespaces">
            <ListContainer
              loading={loading}
              reload={reload}
              data={namespaces}
              getParamsUpdater={getParamsUpdater}
              filters={
                <ClusterPicklist
                  onChange={getParamsUpdater('clusterId')}
                  value={params.clusterId}
                  onlyMasterNodeClusters
                />
              }
              {...pick(listTablePrefs, params)}
            />
          </Tab>
        </Tabs>
      </PageContainer>
    )
  }
}

export const options = {
  addUrl: '/ui/kubernetes/namespaces/add',
  addText: 'Add Namespace',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'created', label: 'Created' },
  ],
  loaderFn: namespaceActions.list,
  deleteFn: namespaceActions.delete,
  name: 'Namespaces',
  title: 'Namespaces',
  ListPage
}

const components = createCRUDComponents(options)
export const NodesList = components.List

export default components.ListPage
