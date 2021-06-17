import React from 'react'
import { Paper } from '@material-ui/core'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { useSelector } from 'react-redux'
import { RootState } from 'app/store'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { prop } from 'ramda'
import useScopedPreferences from 'core/session/useScopedPreferences'
import useDataLoader from 'core/hooks/useDataLoader'
import { regionActions } from 'k8s/components/infrastructure/common/actions'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2, 8),
    margin: theme.spacing(2, 0),
  },
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  bold: {
    fontWeight: 'bold',
  },
}))

const openstackRc = (username, projectName, region, keystoneLink) => {
  return `export OS_AUTH_URL=${keystoneLink}
export OS_IDENTITY_API_VERSION=3
export OS_REGION NAME=“${region}”
export OS_USERNAME=“${username}”
export OS_PASSWORD=“<password>”
export OS_PROJECT_NAME=“${projectName}”
export OS_PROJECT_DOMAIN_ID=\${OS_PROJECT_DOMAIN_ID:-“default”}`
}

const OpenStackRcStep = (): JSX.Element => {
  const { text, bold, paper } = useStyles({})
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const [{ currentTenant, currentRegion: region }] = useScopedPreferences()
  const [tenants] = useDataLoader(mngmTenantActions.list)
  const [regions] = useDataLoader(regionActions.list)
  const projectName = tenants.find((tenant) => tenant.id === currentTenant)?.name
  const link = regions.find((r) => r.id === region)?.links?.self
  const { username } = session
  const keystoneLink = link?.split('/regions')[0]

  return (
    <Paper className={paper} elevation={0}>
      <Text className={clsx(text, bold)}>Configure Bare Metal</Text>
      <Text className={text}>
        Step 1: Copy and paste the export commands below in an SSH session on the Bare Metal
        controller node.
      </Text>
      <CopyToClipboard copyText={openstackRc(username, projectName, region, keystoneLink)}>
        <CodeBlock>{openstackRc(username, projectName, region, keystoneLink)}</CodeBlock>
      </CopyToClipboard>
      <Text className={text}>
        Step 2: Run the following command on the controller node to complete the Bare Metal Setup
      </Text>
      <CopyToClipboard copyText="setup-ironic">
        <CodeBlock>setup-ironic</CodeBlock>
      </CopyToClipboard>
    </Paper>
  )
}

export default OpenStackRcStep
