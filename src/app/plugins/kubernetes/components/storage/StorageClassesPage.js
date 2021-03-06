import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import storageClassActions from 'k8s/components/storage/actions'
import PageContainer from 'core/components/pageContainer/PageContainer'
import useDataLoader from 'core/hooks/useDataLoader'
import { listTablePrefs, allKey } from 'app/constants'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import { pick } from 'ramda'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import { ActionDataKeys } from 'k8s/DataKeys'
import { routes } from 'core/utils/routes'

const defaultParams = {
  healthyClusters: true,
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('StorageClasses', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(storageClassActions.list, params)
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={data}
        getParamsUpdater={getParamsUpdater}
        filters={
          <ClusterPicklist
            selectFirst={false}
            onChange={getParamsUpdater('clusterId')}
            value={params.clusterId}
            onlyHealthyClusters
          />
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

export const options = {
  addUrl: routes.storage.add.path(),
  addText: 'Add Storage Class',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'type', label: 'Type' },
    { id: 'provisioner', label: 'Provisioner' },
    { id: 'created', label: 'Created' },
  ],
  cacheKey: ActionDataKeys.StorageClasses,
  actions: storageClassActions,
  name: 'StorageClasses',
  title: 'Storage Classes',
  ListPage,
}

const { ListPage: ListPageContainer } = createCRUDComponents(options)

export default () => (
  <PageContainer>
    <Tabs>
      <Tab value="storage" label="Storage Classes">
        <ListPageContainer />
      </Tab>
    </Tabs>
  </PageContainer>
)
