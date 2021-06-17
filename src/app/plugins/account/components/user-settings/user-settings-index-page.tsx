import React from 'react'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import MyProfilePage from './my-profile-page'
import MFASettingsPage from './MFASettingsPage'
import { useSelector } from 'react-redux'
import { RootState } from 'app/store'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { prop } from 'ramda'
import { isAdminRole } from 'k8s/util/helpers'

const UserSettingsIndexPage = () => {
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))

  return (
    <PageContainer>
      <Tabs>
        <Tab value="profile" label="My Profile">
          <MyProfilePage />
        </Tab>
        {isAdminRole(session) && (
          <Tab value="mfa" label="MFA">
            <MFASettingsPage />
          </Tab>
        )}
      </Tabs>
    </PageContainer>
  )
}

export default UserSettingsIndexPage
