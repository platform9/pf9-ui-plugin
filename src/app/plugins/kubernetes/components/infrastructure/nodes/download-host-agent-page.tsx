import React from 'react'
import DownloadHostAgentWalkthrough from 'openstack/components/hosts/DownloadHostAgentWalkthrough'
import Theme from 'core/themes/model'
import { Accordion, AccordionDetails, AccordionSummary, makeStyles } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Text from 'core/elements/text'
import SimpleLink from 'core/components/SimpleLink'
import { routes } from 'core/utils/routes'
import ExternalLink from 'core/components/ExternalLink'
import { nodePrerequisitesDocumentationLink } from 'k8s/links'
import CodeBlock from 'core/components/CodeBlock'

const useStyles = makeStyles((theme: Theme) => ({
  downloadHostAgent: {
    maxWidth: '850px',
    margin: theme.spacing(3, 2, 2, 2),
  },
  collapsedContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    marginLeft: theme.spacing(2),
  },
  spacer: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  infoContainer: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
}))

const SupportedDistributionsAndPrerequisitesInfo = () => {
  const classes = useStyles()
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Text variant="h6">Supported Distributions and Prerequisites</Text>
      </AccordionSummary>
      <AccordionDetails>
        <div className={classes.collapsedContainer}>
          <Text>We currently support the following:</Text>
          <ul>
            <li key="linux">Enterprise Linux (CentOS/RedHat) 7.6 - 64-bit (x86_64)</li>
            <li key="ubuntu">Ubuntu 16.04 LTS and 18.04 LTS -64-bit (x86_64)</li>
          </ul>
          <Text>
            If your node operating system isn't supported, please email us at{' '}
            <a href={'www.google.com'}>support@platform9.com</a>
          </Text>
          <p></p>
          <Text>Folow these prerequisites to prepare your nodes: </Text>
          <ul>
            <li key="kubernetes">
              Managaged Kubernetes:{' '}
              <ExternalLink url={nodePrerequisitesDocumentationLink}>
                Managed Kubernetes Prerequisite
              </ExternalLink>
            </li>
          </ul>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

const TipsAndTroubleshootingInfo = () => {
  const classes = useStyles()
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Text variant="h6">Tips and Troubleshooting</Text>
      </AccordionSummary>
      <AccordionDetails>
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
      </AccordionDetails>
    </Accordion>
  )
}

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

const DownloadHostAgentPage = () => {
  const classes = useStyles()
  return (
    <div className={classes.downloadHostAgent}>
      <DownloadHostAgentWalkthrough />
      <p></p>
      <Text>
        Once the host agent is installed, you will see an alert in the{' '}
        <SimpleLink src={routes.dashboard.path()}>Dashboard</SimpleLink> asking you to authorize the
        node.
      </Text>
      <p className={classes.spacer} />
      <SupportedDistributionsAndPrerequisitesInfo />
      <TipsAndTroubleshootingInfo />
    </div>
  )
}

export default DownloadHostAgentPage
