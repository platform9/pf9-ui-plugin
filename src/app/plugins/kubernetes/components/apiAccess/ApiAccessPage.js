import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import PageContainer from 'core/components/pageContainer/PageContainer'
import ApiAccessListPage from './ApiAccessListPage'
import KubeConfigListPage from './kubeConfig/KubeConfigListPage'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import TerraformListPage from './TerraformListPage'

const ApiAccessPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="api" label="API">
        <ApiAccessListPage />
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

export default ApiAccessPage
