import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import PageContainer from 'core/components/pageContainer/PageContainer'
import KubeConfigListPage from './kubeConfig/KubeConfigListPage'
import TerraformListPage from './TerraformListPage'
import ApiServicesPage from './ApiServicesPage'
import { makeStyles } from '@material-ui/styles'
import DocumentMeta from 'core/components/DocumentMeta'

const useStyles = makeStyles((theme) => ({
  tab: {
    backgroundColor: 'transparent',
  },
}))

const ApiAccessPage = () => {
  const classes = useStyles()
  return (
    <PageContainer>
      <DocumentMeta title="Api Access" bodyClasses={['form-view']} />
      <Tabs className={classes.tab}>
        <Tab value="api" label="API Services">
          <ApiServicesPage />
        </Tab>
        <Tab value="kubeconfig" label="KubeConfig">
          <KubeConfigListPage />
        </Tab>
        <Tab value="terraform" label="Terraform">
          <TerraformListPage />
        </Tab>
      </Tabs>
    </PageContainer>
  )
}

export default ApiAccessPage
