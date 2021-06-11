import { useAppSelector } from 'app/store'
import DocumentMeta from 'core/components/DocumentMeta'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Progress from 'core/components/progress/Progress'
import Tab from 'core/components/tabs/Tab'
import Tabs from 'core/components/tabs/Tabs'
import useDataLoader from 'core/hooks/useDataLoader'
import useListAction from 'core/hooks/useListAction'
import React from 'react'
import { emptyObj } from 'utils/fp'
import { listClusters } from '../infrastructure/clusters/actions'
import { makeParamsClustersSelector } from '../infrastructure/clusters/selectors'
import { importedClusterActions } from '../infrastructure/importedClusters/actions'
import KubevirtLandingPage from './kubevirt-landing-page'
import VirtualMachinesListPage from './list-page'

const selector = makeParamsClustersSelector()

const VirtualMachinesPage = () => {
  const [loadingClusters] = useListAction(listClusters)
  const clusters = useAppSelector((state) => selector(state, emptyObj))
  const [importedClusters, loadingImportedClusters] = useDataLoader(importedClusterActions.list)
  const hasKubevirtClusters = [...clusters, ...importedClusters].find(
    (cluster) => !!cluster.deployKubevirt,
  )
  return (
    <PageContainer>
      <DocumentMeta title="Virtual Machines" />
      <Progress loading={loadingClusters || loadingImportedClusters} renderContentOnMount={false}>
        {!hasKubevirtClusters ? (
          <KubevirtLandingPage />
        ) : (
          <Tabs>
            <Tab value="virtual-machines" label="VM Instances">
              <VirtualMachinesListPage />
            </Tab>
            {/* <Tab value="data-volumes" label="Data Volumes">
        <div>Coming soon</div>
      </Tab> */}
            {/* <Tab value="presets" label="Presets">
        <div>Coming soon</div>
      </Tab>
      <Tab value="snapshots" label="Snapshots">
        <div>Coming soon</div>
      </Tab> */}
          </Tabs>
        )}
      </Progress>
    </PageContainer>
  )
}

export default VirtualMachinesPage
