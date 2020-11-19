import React from 'react'
import DownloadHostAgentWalkthrough from 'openstack/components/hosts/DownloadHostAgentWalkthrough'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/core'
import Text from 'core/elements/text'
import CodeBlock from 'core/components/CodeBlock'
import Info from 'core/components/validatedForm/Info'

const useStyles = makeStyles((theme: Theme) => ({
  downloadHostAgent: {
    maxWidth: '850px',
    display: 'flex',
    flexFlow: 'column nowrap',
    position: 'relative',
    margin: theme.spacing(3, 2, 2, 2),
  },
  collapsedContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    marginLeft: theme.spacing(2),
  },
  spacer: {
    height: theme.spacing(0.5),
  },
  infoContainer: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
}))

const TroubleshootingTipsList = () => (
  <ul>
    <li>
      Verify that the node has outbound network connectivity to the internet and to the Platform9
      controller:
    </li>
    <CodeBlock>{'ping www.google.com \ntelnet pmkft-1584219278-18238.platform9.io 443'}</CodeBlock>
    <li>
      If you have a proxy server set up, make sure to configure the host agent to route traffic via
      the proxy:
    </li>
    <CodeBlock>{'sudo bash <path to installer> --proxy=<proxy server>:<proxy port>'}</CodeBlock>
    <li>Confirm that the host agent is running on your node:</li>
    <CodeBlock>{'sudo service pf9-hostagent status'}</CodeBlock>
    <li>Check the host agent log and the comms log for errors:</li>
    <CodeBlock>{'sudo cat /var/log/pf9/hostagent.log /var/log/pf9/comms/comms.log'}</CodeBlock>
  </ul>
)

const SupportedDistributionsAndPrerequisitesInfo = () => {
  const classes = useStyles()

  return (
    <Info title="Supported Distributions and Prerequisites" expanded={false}>
      <div className={classes.collapsedContainer}>
        <Text variant="subtitle2">Tips</Text>
        <div className={classes.infoContainer}>
          <Text>
            The host agent package is personalized for your account. Do not share it with anyone
            outside your organization.
          </Text>
        </div>
        <p></p>
        <Text variant="subtitle2">Troubleshooting</Text>
        <div className={classes.infoContainer}>
          <Text>Here are some quick tips if you don't see your node:</Text>
          <TroubleshootingTipsList />
          <Text>
            If these tips do not resolve the issue, please contact us for support. We're here to
            help!
          </Text>
        </div>
      </div>
    </Info>
  )
}

const TipsAndTroubleshootingInfo = () => {
  const classes = useStyles()
  return (
    <Info title="Tips and Troubleshooting" expanded={false}>
      <div className={classes.collapsedContainer}>
        <Text variant="subtitle2">Tips</Text>
        <div className={classes.infoContainer}>
          <Text>
            The host agent package is personalized for your account. Do not share it with anyone
            outside your organization.
          </Text>
        </div>
        <p className={classes.spacer}></p>
        <Text variant="subtitle2">Troubleshooting</Text>
        <div className={classes.infoContainer}>
          <Text>Here are some quick tips if you don't see your node:</Text>
          <TroubleshootingTipsList />
          <Text>
            If these tips do not resolve the issue, please contact us for support. We're here to
            help!
          </Text>
        </div>
      </div>
    </Info>
  )
}

const DownloadHostAgentPage = () => {
  const classes = useStyles()
  return (
    <div className={classes.downloadHostAgent}>
      <Text variant="h5">Onboard new nodes using the HostAgent</Text>
      <p>
        <Text component="span">
          The Platform9 HostAgent can be used to manually connect physical servers and virtual
          machines to the SaaS Management plane. Once the HostAgent is installed each node must be
          authorized on the Nodes dashboard.
        </Text>
      </p>
      <DownloadHostAgentWalkthrough />
      <p className={classes.spacer}></p>
      <SupportedDistributionsAndPrerequisitesInfo />
      <p className={classes.spacer}></p>
      <TipsAndTroubleshootingInfo />
    </div>
  )
}

export default DownloadHostAgentPage
