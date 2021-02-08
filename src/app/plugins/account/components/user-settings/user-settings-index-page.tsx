import React from 'react'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import MyProfilePage from './my-profile-page'

const UserSettingsIndexPage = () => (
  <PageContainer>
    <Tabs>
      <Tab value="profile" label="My Profile">
        <MyProfilePage />
      </Tab>
    </Tabs>
  </PageContainer>
)

export default UserSettingsIndexPage
