import { Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { hexToRgbaCss } from 'core/utils/colorHelpers'
import React from 'react'
import { useSelector } from 'react-redux'
import Text from 'core/elements/text'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { prop } from 'ramda'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { runPf9CliCommand } from '../clusters/constants'
import CodeBlock from 'core/components/CodeBlock'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import SubmitButton from 'core/components/buttons/SubmitButton'
import NumberedSteps from 'core/components/numbered-steps'
import SimpleLink from 'core/components/SimpleLink'
import useScopedPreferences from 'core/session/useScopedPreferences'

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2, 8),
    margin: theme.spacing(2, 0),
    backgroundColor: hexToRgbaCss(theme.palette.primary.main, 0.1),
  },
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
}))

const downloadLink =
  'https://pmkft-assets.s3-us-west-1.amazonaws.com/OVA_Images/Platform9_Ubuntu_20.04.ova'

const DownloadOvaWalkthrough = (): JSX.Element => {
  const classes = useStyles({})
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const [, , getUserPrefs] = useScopedPreferences()
  const { currentTenant, currentRegion } = getUserPrefs(session.username)

  return (
    <Paper className={classes.paper} elevation={0}>
      <Text variant="h6">Download and start the OVA image</Text>
      <NumberedSteps
        step={1}
        description={
          <div>
            <Text>Download the OVA</Text>
            <SimpleLink src={downloadLink}>
              <SubmitButton className={classes.downloadButton}>
                Download
                <FontAwesomeIcon className={classes.downloadIcon} size="sm" solid>
                  download
                </FontAwesomeIcon>
              </SubmitButton>
            </SimpleLink>
          </div>
        }
      />
      <NumberedSteps
        step={2}
        description={
          <Text>Import and then start the OVA using VirtualBox, VMware Workstation or vSphere</Text>
        }
      />
      <NumberedSteps
        step={3}
        description={
          <div>
            <div>
              <Text>Login using admin/admin and run</Text>
              <div className={classes.spaceAbove}>
                <CopyToClipboard copyText={runPf9CliCommand}>
                  <CodeBlock>{runPf9CliCommand}</CodeBlock>
                </CopyToClipboard>
              </div>
            </div>
            <div className={classes.spaceAbove}>
              <Text variant="body1">Here's your info for quick use:</Text>
              <Text component="div" variant="body1">
                Account URL:{' '}
                <CopyToClipboard copyText={window.location.origin} codeBlock={false}>
                  <span className={classes.linkText}>{window.location.origin}</span>
                </CopyToClipboard>
              </Text>
              <Text component="div" variant="body1">
                Username:{' '}
                <CopyToClipboard copyText={session.username} codeBlock={false}>
                  <span className={classes.linkText}>{session.username}</span>
                </CopyToClipboard>
              </Text>
              <Text component="div" variant="body1">
                Tenant:{' '}
                <CopyToClipboard copyText={currentTenant} codeBlock={false}>
                  <span className={classes.linkText}>{currentTenant}</span>
                </CopyToClipboard>
              </Text>
              <Text component="div" variant="body1">
                Region:{' '}
                <CopyToClipboard copyText={currentRegion} codeBlock={false}>
                  <span className={classes.linkText}>{currentRegion}</span>
                </CopyToClipboard>
              </Text>
            </div>
          </div>
        }
      />
      <NumberedSteps
        step={4}
        description={<Text>Return to Create Cluster to use the new node</Text>}
      />
    </Paper>
  )
}

export default DownloadOvaWalkthrough
