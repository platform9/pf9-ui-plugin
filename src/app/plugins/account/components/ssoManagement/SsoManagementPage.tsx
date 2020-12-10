import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import SsoPage from './sso/SsoPage'
import GroupsListPage from './groups/GroupsListPage'
import PageContainer from 'core/components/pageContainer/PageContainer'
import DocumentMeta from 'core/components/DocumentMeta'

const SsoManagementPage = () => {
  return (
    <PageContainer>
      <DocumentMeta title="SSO Management" />
      <Tabs>
        {false && (
          <Tab value="sso" label="SSO">
            <SsoPage />
          </Tab>
        )}
        <Tab value="groups" label="Groups">
          <GroupsListPage />
        </Tab>
      </Tabs>
    </PageContainer>
  )
}

export default SsoManagementPage
