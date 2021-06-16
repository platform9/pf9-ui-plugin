import React from 'react'
import Text from 'core/elements/text'
import CodeBlock from 'core/components/CodeBlock'
import CopyToClipboard from 'core/components/CopyToClipboard'
import {
  configureCliCommand,
  downloadAndInstallPf9CliCommand,
  runPf9CliCommand,
} from '../infrastructure/clusters/constants'
import Info from 'core/components/validatedForm/Info'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { useSelector } from 'react-redux'
import { prop } from 'ramda'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import BulletList from 'core/components/BulletList'

const useStyles = makeStyles((theme: Theme) => ({
  linkText: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
  },
  spaceAbove: {
    marginTop: theme.spacing(2),
  },
  downloadIcon: {
    marginLeft: theme.spacing(1),
  },
  downloadButton: {
    marginTop: theme.spacing(1),
  },
  userInfo: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}))

const StepOne = (
  <>
    <Text>Download the CLI for each node</Text>
    <CopyToClipboard copyText={downloadAndInstallPf9CliCommand}>
      <CodeBlock>{<Text variant="body2">{downloadAndInstallPf9CliCommand}</Text>}</CodeBlock>
    </CopyToClipboard>
  </>
)

const StepTwo = (
  <>
    <Text>Configure the CLI</Text>
    <CopyToClipboard copyText={configureCliCommand}>
      <CodeBlock>{<Text variant="body2">{configureCliCommand}</Text>}</CodeBlock>
    </CopyToClipboard>
  </>
)

const StepThree = (
  <>
    <Text>
      Using a user with SUDO privileges, run the PF9 CLI command Prep-Node to attach the node to
      Platform9.
    </Text>
    <CopyToClipboard copyText={runPf9CliCommand}>
      <CodeBlock>{<Text variant="body2">{runPf9CliCommand}</Text>}</CodeBlock>
    </CopyToClipboard>
  </>
)

const downloadSteps = [StepOne, StepTwo, StepThree]

const DownloadCliWalkthrough = () => {
  const classes = useStyles()
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)

  return (
    <Info title="Use the PF9 CLI to connect nodes to the Platform9 Management Plane">
      <BulletList type="decimal" items={downloadSteps} />
      <div className={classes.userInfo}>
        <Text component="div" variant="body1">
          <b>Account URL: </b>
          <CopyToClipboard copyText={window.location.origin} codeBlock={false}>
            <span className={classes.linkText}>{window.location.origin}</span>
          </CopyToClipboard>
        </Text>
        <Text component="div" variant="body1">
          <b>Username: </b>
          <CopyToClipboard copyText={session.username} codeBlock={false}>
            <span className={classes.linkText}>{session.username}</span>
          </CopyToClipboard>
        </Text>
      </div>
    </Info>
  )
}

export default DownloadCliWalkthrough
