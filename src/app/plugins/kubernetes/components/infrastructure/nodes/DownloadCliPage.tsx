// Libs
import React, { FunctionComponent } from 'react'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
// Components
import { DownloadCliOnboardNodeWalkthrough } from './DownloadCliWalkthrough'
import CopyToClipboard from 'core/components/CopyToClipboard'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'

const useStyles = makeStyles((theme: Theme) => ({
  downloadCLIContainer: {
    maxWidth: '850px',
    display: 'flex',
    flexFlow: 'column nowrap',
    position: 'relative',
    margin: theme.spacing(3, 2, 2, 2),
  },
  spacer: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  backLink: {
    marginBottom: theme.spacing(2),
    marginLeft: 'auto',
  },
}))

const DownloadCliPage: FunctionComponent = () => {
  const classes = useStyles()
  return (
    <div className={classes.downloadCLIContainer}>
      <Text variant="h5">Onboard new nodes using the PF9 CLI</Text>
      <p> </p>
      <Text component="span">
        In order to add a physical or virtual node to your BareOS cluster, you need to first
        download and install the Platform9 CLI on that node. Follow the instructions below to
        download and install the CLI on your node
      </Text>
      <DownloadCliOnboardNodeWalkthrough />

      <p className={classes.spacer} />
      <Text variant="h6">CLI Advanced Options</Text>
      <p> </p>
      <Text component="p" variant="subtitle2">
        Create clusters and more directly using the CLI
      </Text>
      <p> </p>
      <Text component="span" variant="body1">
        You can use the{' '}
        <CopyToClipboard copyText="pf9ctl">
          <CodeBlock>pf9ctl</CodeBlock>
        </CopyToClipboard>{' '}
        CLI directly to use one or more PMK clusters. Type{' '}
        <CopyToClipboard copyText="pf9ctl --help">
          <CodeBlock>pf9ctl --help</CodeBlock>
        </CopyToClipboard>{' '}
        to see the full features and options the CLI supports
      </Text>
      <p> </p>
      {/* <Text variant="body1">
        See <SimpleLink src="">CLI Documentation</SimpleLink> for more info on whats supported with the
        CLI
      </Text> */}
    </div>
  )
}
export default DownloadCliPage
