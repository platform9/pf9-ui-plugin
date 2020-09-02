import React from 'react'
import { Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { useSelector } from 'react-redux'
import { RootState } from 'app/store'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { prop } from 'ramda'

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
  const {
    username,
    userDetails: {
      Tenants: {
        lastTenant: { name: projectName },
      },
      RegionChooser: {
        lastRegion: {
          id: region,
          links: { self: link },
        },
      },
    },
  } = session
  const keystoneLink = link.split('/regions')[0]

  return (
    <Paper className={paper} elevation={0}>
      <Typography className={clsx(text, bold)}>Configure Bare Metal</Typography>
      <Typography className={text}>
        Step 1: Copy and paste the export commands below in an SSH session on the Bare Metal
        controller node.
      </Typography>
      <CopyToClipboard copyText={openstackRc(username, projectName, region, keystoneLink)}>
        <CodeBlock>{openstackRc(username, projectName, region, keystoneLink)}</CodeBlock>
      </CopyToClipboard>
      <Typography className={text}>
        Step 2: Run the following command on the controller node to complete the Bare Metal Setup
      </Typography>
      <CopyToClipboard copyText="setup-ironic">
        <CodeBlock>setup-ironic</CodeBlock>
      </CopyToClipboard>
    </Paper>
  )
}

export default OpenStackRcStep
