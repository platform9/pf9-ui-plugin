// Libs
import React, { FunctionComponent } from 'react'
import { Typography } from '@material-ui/core'

// Components
import PageContainer from 'core/components/pageContainer/PageContainer'
import SimpleLink from 'core/components/SimpleLink'
import DownloadCliWalkthrough from './DownloadCliWalkthrough'

const AnyLink: any = SimpleLink
const finalStep = {
  title: 'Node ready to be added',
  description: 'This node is now ready to be added to a BareOS cluster. Use the "create cluster" or "scale cluster" operations to add the node to a cluster',
}

const ClusterDetailsPage: FunctionComponent = () => {
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
      <p>{' '}</p>
      <Typography variant="body1">
        See <AnyLink src="">CLI Documentation</AnyLink> for more info on whats supported with the
        CLI
      </Typography>
    </PageContainer>
  )
}
export default ClusterDetailsPage
