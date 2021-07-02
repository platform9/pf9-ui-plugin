import React from 'react'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import DownloadOvaWalkthrough from './download-ova-walkthrough'
import Info from 'core/components/validatedForm/Info'
import ExternalLink from 'core/components/ExternalLink'
import { ovaDocumentationLink } from 'k8s/links'

const useStyles = makeStyles((theme: Theme) => ({
  downloadOvaContainer: {
    maxWidth: '850px',
    margin: theme.spacing(3, 2, 2, 2),
  },
  downloadOvaHeader: {
    marginBottom: theme.spacing(2),
  },
  collapsedContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    marginLeft: theme.spacing(2),
  },
  externalLink: {
    float: 'right',
    margin: theme.spacing(1),
  },
  infoCardHeader: {
    marginTop: theme.spacing(2),
  },
  spacer: {
    height: theme.spacing(0.5),
  },
}))

const DownloadOvaPage = () => {
  const classes = useStyles()
  return (
    <div className={classes.downloadOvaContainer}>
      <header className={classes.downloadOvaHeader}>
        <Text variant="h5">Onboard new nodes using the Platform9 Ubuntu 20.04 OVA</Text>
      </header>
      <Text>
        Platform9 has a preconfigured OVA image running Ubuntu 20.04 that is pre-configured to run
        as a single cluster on a laptop or desktop. To use the OVA in a multi-node cluster, the CPU
        and RAM configuration should be changed.
      </Text>
      <DownloadOvaWalkthrough />
      <p className={classes.spacer} />
      <Info title="Customize the OVA Image" expanded={false}>
        <div className={classes.collapsedContainer}>
          <div className={classes.infoCardHeader}>
            <ExternalLink
              className={classes.externalLink}
              url={ovaDocumentationLink}
              icon="file-alt"
            >
              OVA Help
            </ExternalLink>
          </div>
          <Text>
            The OVA image is configured with 2 CPUs and 8GB of RAM and is designed to run as a
            single-node cluster on a laptop or desktop. Implement the changes below to use the OVA
            in a multi-node cluster.
          </Text>
          <p />
          <Text>Master Node Configuration: CPUs 2 | RAM 10GB Minimum | HDD 30GB</Text>
          <p />
          <Text>Worker Node Configuration: CPUs 4 | RAM 16GB Minimum | HDD 30GB</Text>
          <Text>NOTE: Worker node configuration will vary based on workload requirements</Text>
        </div>
      </Info>
    </div>
  )
}

export default DownloadOvaPage
