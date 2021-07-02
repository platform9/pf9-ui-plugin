import React, { useMemo } from 'react'
import Text from 'core/elements/text'
import SimpleLink from 'core/components/SimpleLink'
import SubmitButton from 'core/components/SubmitButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import CodeBlock from 'core/components/CodeBlock'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { runPf9CliCommand } from '../infrastructure/clusters/constants'
import Info from 'core/components/validatedForm/Info'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { useSelector } from 'react-redux'
import { prop } from 'ramda'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import BulletList from 'core/components/BulletList'
import useScopedPreferences from '../../../../core/session/useScopedPreferences'
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
    marginBottom: theme.spacing(1),
  },
  userInfo: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}))

const downloadLink =
  'https://pmkft-assets.s3-us-west-1.amazonaws.com/OVA_Images/Platform9_Ubuntu_20.04.ova'

const StepTwo = (
  <Text>Import and then start the OVA using VirtualBox, VMware Workstation or vSphere</Text>
)

const StepThree = (
  <>
    <Text>Login using admin/admin and run</Text>

    <CopyToClipboard copyText={runPf9CliCommand}>
      <CodeBlock>{<Text variant="body2">{runPf9CliCommand}</Text>}</CodeBlock>
    </CopyToClipboard>
  </>
)

const StepFour = <Text>Return to Create Cluster to use the new node</Text>

const DownloadOvaWalkthrough = () => {
  const classes = useStyles()
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const { getUserPrefs } = useScopedPreferences()
  const { currentTenant, currentRegion } = getUserPrefs(session.username)

  const StepOne = useMemo(
    () => (
      <>
        <Text>Download the OVA</Text>
        <SimpleLink src={downloadLink}>
          <SubmitButton className={classes.downloadButton}>
            Download
            <FontAwesomeIcon className={classes.downloadIcon} size="sm" solid>
              download
            </FontAwesomeIcon>
          </SubmitButton>
        </SimpleLink>
      </>
    ),
    [],
  )

  const downloadSteps = [StepOne, StepTwo, StepThree, StepFour]

  return (
    <Info title="Download and start the OVA image">
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
        <Text component="div" variant="body1">
          <b>Tenant: </b>
          <CopyToClipboard copyText={currentTenant} codeBlock={false}>
            <span className={classes.linkText}>{currentTenant}</span>
          </CopyToClipboard>
        </Text>
        <Text component="div" variant="body1">
          <b>Region: </b>
          <CopyToClipboard copyText={currentRegion} codeBlock={false}>
            <span className={classes.linkText}>{currentRegion}</span>
          </CopyToClipboard>
        </Text>
      </div>
    </Info>
  )
}

export default DownloadOvaWalkthrough
