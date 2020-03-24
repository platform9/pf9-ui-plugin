import React, { FC } from 'react'
import { Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { hexToRGBA } from 'core/utils/colorHelpers'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { prop } from 'ramda'
import { useSelector } from 'react-redux'

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2, 8),
    margin: theme.spacing(2, 0),
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
  },
  column: {
    margin: theme.spacing(2, 0),
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    margin: theme.spacing(1, 0),
  },
  step: {
    color: theme.palette.secondary.contrastText,
    marginRight: theme.spacing(2),
    flex: `0 0 ${theme.spacing(5)}px`,
    width: theme.spacing(5),
    height: theme.spacing(5),
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // border: `2px solid ${theme.palette.text.primary}`,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '100%',
    // color: theme.palette.text.primary,
  },
  spacer: {
    margin: theme.spacing(1, 0),
  },
  linkText: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
  },
}))

const downloadAndInstallCommand = 'bash <(curl -sL http://pf9.io/get_cli)'

// Not super enthused about this. Need to have different content for bareos flow vs landing page.
export const DownloadCliOnboardNodeWalkthrough = (): JSX.Element => (
  <>
    <Typography variant="h6">Pre-requisites</Typography>
    <p>
      <Typography component="span">
        You will need a physical or virtual machine with Ubuntu 16.04 installed. (Support for CentOS
        is coming soon!)
      </Typography>
    </p>
    <DownloadCliWalkthrough />
  </>
)

const DownloadCliWalkthrough = (): JSX.Element => {
  const classes = useStyles({})
  const session = useSelector(prop(sessionStoreKey))
  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography variant="h6">
        Use the PF9 CLI to connect nodes to the Platform9 Management Plane
      </Typography>
      <NumberedSteps
        step={1}
        title="Download and install the CLI"
        description={
          <CopyToClipboard copyText={downloadAndInstallCommand}>
            <CodeBlock>{downloadAndInstallCommand}</CodeBlock>
          </CopyToClipboard>
        }
      />
      <Typography variant="body1">Here's your info for quick use:</Typography>
      <Typography component="div" variant="body1">
        Account URL:{' '}
        <CopyToClipboard copyText={window.location.origin} codeBlock={false}>
          <span className={classes.linkText}>{window.location.origin}</span>
        </CopyToClipboard>
      </Typography>
      <Typography component="div" variant="body1">
        Username:{' '}
        <CopyToClipboard copyText={session.username} codeBlock={false}>
          <span className={classes.linkText}>{session.username}</span>
        </CopyToClipboard>
      </Typography>
      <NumberedSteps
        step={2}
        title="Run the PF9 CLI using ‘prep-node’ to attach the Node to the Platform9 Management plane"
        description={
          <CopyToClipboard copyText="pf9ctl cluster prep-node">
            <CodeBlock>pf9ctl cluster prep-node</CodeBlock>
          </CopyToClipboard>
        }
      />
    </Paper>
  )
}

interface NumberedStepProps {
  step: number
  title: string
  description: string | JSX.Element
}

const NumberedSteps: FC<NumberedStepProps> = ({
  step,
  title,
  description,
  children,
}): JSX.Element => {
  const classes = useStyles({})
  return (
    <div className={classes.column}>
      <Typography variant="subtitle2">{title}</Typography>
      <div className={classes.row}>
        <Typography variant="body1" className={classes.step}>
          {step}
        </Typography>
        {typeof description === 'string' ? (
          <Typography variant="body1">{description}</Typography>
        ) : (
            description
          )}
        {children}
      </div>
    </div>
  )
}

export default DownloadCliWalkthrough
