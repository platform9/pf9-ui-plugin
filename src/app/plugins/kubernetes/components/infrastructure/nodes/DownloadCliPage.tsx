// Libs
import React, { FunctionComponent } from 'react'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
// Components
import Theme from 'core/themes/model'
import PageContainer from 'core/components/pageContainer/PageContainer'
import DownloadCliWalkthrough, {
  CliAdvancedOptions,
  OsRequirements,
} from './DownloadCliWalkthrough'

const useStyles = makeStyles((theme: Theme) => ({
  downloadCLIContainer: {
    maxWidth: '850px',
    margin: theme.spacing(3, 2, 2, 2),
  },
  spacer: {
    height: theme.spacing(0.5),
  },
}))

const DownloadCliPage: FunctionComponent = () => {
  const classes = useStyles()
  return (
    <PageContainer className={classes.downloadCLIContainer}>
      <Text variant="h5">Onboard new nodes using the PF9 CLI</Text>
      <p> </p>
      <Text component="span">
        In order to add a physical or virtual node to your BareOS cluster, you need to first
        download and install the Platform9 CLI on that node. Follow the instructions below to
        download and install the CLI on your node
      </Text>
      {/* <Text variant="body1">
        See <SimpleLink src="">CLI Documentation</SimpleLink> for more info on whats supported with the
        CLI
      </Text> */}
      <DownloadCliWalkthrough />
      <p className={classes.spacer} />
      <OsRequirements />
      <p className={classes.spacer} />
      <CliAdvancedOptions />
    </PageContainer>
  )
}
export default DownloadCliPage
