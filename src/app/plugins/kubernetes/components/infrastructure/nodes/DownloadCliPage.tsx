// Libs
import React, { FunctionComponent } from 'react'
import { Typography, Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

// Components
import PageContainer from 'core/components/pageContainer/PageContainer'
import SimpleLink from 'core/components/SimpleLink'
import DownloadCliWalkthrough from './DownloadCliWalkthrough'
import CopyToClipboard from 'core/components/CopyToClipboard'
import CodeBlock from 'core/components/CodeBlock'

const useStyles = makeStyles((theme: Theme) => ({
  spacer: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
}))

const AnyLink: any = SimpleLink
const finalStep = {
  title: 'Node ready to be added',
  description: 'This node is now ready to be added to a BareOS cluster. Use the "create cluster" or "scale cluster" operations to add the node to a cluster',
}

const ClusterDetailsPage: FunctionComponent = () => {
  const { spacer } = useStyles({})
  return (
    <PageContainer>
      <Typography variant="h5">Onboard a new node</Typography>
      <p> </p>
      <Typography component="span">
        In order to add a physical or virtual node to your BareOS cluster, you need to first
        download and install the Platform9 CLI on that node. Follow the instructions below to
        download and install the CLI on your node
      </Typography>
      <DownloadCliWalkthrough finalStep={finalStep} />

      <p className={spacer} />
      <Typography variant="h6">CLI Advanced Options</Typography>
      <p> </p>
      <Typography component="p" variant="subtitle2">
        Create clusters and more directly using the CLI
      </Typography>
      <Typography component="span" variant="body1">
        You can use the <CopyToClipboard copyText="pf9ctl"><CodeBlock>pf9ctl</CodeBlock></CopyToClipboard> CLI directly to use one or more PMK clusters.
        Type <CopyToClipboard copyText="pf9ctl --help"><CodeBlock>pf9ctl --help</CodeBlock></CopyToClipboard> to see the full features and options the CLI
        supports
      </Typography>
      <p>{' '}</p>
      <Typography variant="body1">
        See <AnyLink src="">CLI Documentation</AnyLink> for more info on whats supported with the
        CLI
      </Typography>
    </PageContainer>
  )
}
export default ClusterDetailsPage
