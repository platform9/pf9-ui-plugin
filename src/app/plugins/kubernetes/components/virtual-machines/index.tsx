import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import PageContainer from 'core/components/pageContainer/PageContainer'
import VirtualMachinesListPage from './list-page'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from '../infrastructure/clusters/actions'
import { importedClusterActions } from '../infrastructure/importedClusters/actions'
import DocumentMeta from 'core/components/DocumentMeta'
import Progress from 'core/components/progress/Progress'
import KubevirtLandingPage from './kubevirt-landing-page'

const VirtualMachinesPage = () => {
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
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
