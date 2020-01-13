import React, { FC, useContext } from 'react'
import { Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import SimpleLink from 'core/components/SimpleLink'
import { whatIsBareOSLink } from 'app/constants'
import Theme from 'core/themes/model'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { AppContext } from 'core/providers/AppProvider'

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2, 8),
    margin: theme.spacing(2, 0),
    backgroundColor: theme.palette.card.background,
  },
  row: {
    display: 'flex',
    margin: theme.spacing(2, 0),
  },
  step: {
    color: theme.palette.secondary.contrastText,
    marginRight: theme.spacing(2),
    flex: `0 0 ${theme.spacing(3.5)}px`,
    width: theme.spacing(3.5),
    height: theme.spacing(3.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // border: `2px solid ${theme.palette.text.primary}`,
    backgroundColor: theme.palette.wizard.dark,
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

const AnyLink: any = SimpleLink

const installCommand = {
  displayText:
    'curl -O https://raw.githubusercontent.com/platform9/express-cli/master/cli-setup.sh',
  copyText: 'curl -O https://raw.githubusercontent.com/platform9/express-cli/master/cli-setup.sh',
}

// Not super enthused about this. Need to have different content for bareos flow vs landing page.
export const DownloadCliBareOSWalkthrough = (): JSX.Element => (
  <>
    <Typography component="span">
      In order to create a BareOS cluster, you need to first download and install the Platform9 CLI
      on each of your physical or virtual machines that you wish to add to the cluster. Follow the
      instructions below to download the CLI
    </Typography>
    <DownloadCliWalkthrough />
  </>
)

const defaultFinalStep = {
  title: 'Refresh this page',
  description:
    'After refreshing, you should now see those nodes. Select them to be added to your cluster',
}

const DownloadCliWalkthrough = ({ finalStep = defaultFinalStep }): JSX.Element => {
  const classes = useStyles({})
  const { session } = useContext(AppContext)
  return (
    <>
      <p>
        <AnyLink src={whatIsBareOSLink}>What is BareOS?</AnyLink>
      </p>
      <p> </p>
      <Typography variant="h6">Pre-requisites</Typography>
      <p>
        <Typography component="span">
          You will need a physical or virtual machine with Ubuntu 16.04 installed. (Support for
          CentOS is coming soon!)
        </Typography>
      </p>
      <Paper className={classes.paper} elevation={0}>
        <Typography variant="h6">Install and Run</Typography>
        <NumberedSteps
          step={1}
          title="Download CLI installer (or Skip to Step 3 if you have the CLI installed already)"
          description={
            <CopyToClipboard copyText={installCommand.copyText}>
              <CodeBlock>{installCommand.displayText}</CodeBlock>
            </CopyToClipboard>
          }
        />
        <NumberedSteps
          step={2}
          title="Run the CLI installer (or Skip to Step 3 if you have the CLI installed already)"
          description={
            <CopyToClipboard copyText="bash ./cli-setup.sh">
              <CodeBlock>bash ./cli-setup.sh</CodeBlock>
            </CopyToClipboard>
          }
        >
          <Typography variant="subtitle2" className={classes.spacer}>
            The installer will ask for your PMK account info. Here's your info for quick use:
          </Typography>
          <Typography variant="body1">
            Your Platform9 account management URL:{' '}
            <CopyToClipboard copyText={window.location.origin}>
              <span className={classes.linkText}>{window.location.origin}</span>
            </CopyToClipboard>
          </Typography>
          <Typography variant="body1">
            Your Platform9 username:{' '}
            <CopyToClipboard copyText={session.username}>
              <span className={classes.linkText}>{session.username}</span>
            </CopyToClipboard>
          </Typography>
        </NumberedSteps>
        <NumberedSteps
          step={3}
          title="Run the CLI to prepare your node (NOTE: The CLI, once installed, can also connect to and work with remote nodes using ssh so you only really need to install it once!)"
          description={
            <CopyToClipboard copyText="pf9ctl cluster prep-node">
              <CodeBlock>pf9ctl cluster prep-node</CodeBlock>
            </CopyToClipboard>
          }
        />
        <NumberedSteps step={4} {...finalStep} />
      </Paper>
    </>
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
    <div className={classes.row}>
      <Typography variant="body1" className={classes.step}>
        {step}
      </Typography>
      <div>
        <Typography variant="subtitle2">{title}</Typography>
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
