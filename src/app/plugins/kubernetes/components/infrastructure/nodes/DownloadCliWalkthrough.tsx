import React from 'react'
import { Typography, Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import SimpleLink from 'core/components/SimpleLink'
import { whatIsBareOSLink } from 'app/constants'
import CopyToClipboard from 'core/components/CopyToClipboard'

const useStyles = makeStyles((theme: Theme) => ({
  row: {
    display: 'flex',
    margin: theme.spacing(2, 0),
  },
  step: {
    marginRight: theme.spacing(2),
    flex: `0 0 ${theme.spacing(4.5)}px`,
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${theme.palette.text.primary}`,
    borderRadius: '100%',
    color: theme.palette.text.primary,
  },
}))

const AnyLink: any = SimpleLink

const installCommand = {
  displayText: '> curl -O https://raw.githubusercontent.com/platform9/express-cli/master/cli-setup.sh\n' +
  '> bash ./cli-setup.sh',
  copyText: 'curl -O https://raw.githubusercontent.com/platform9/express-cli/master/cli-setup.sh \nbash ./cli-setup.sh',
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
  title: 'Refresh grid',
  description: 'Once you have installed the CLI on the required nodes, refresh the grid above. You should now see those nodes in the grid and you can select them to be added to your cluster',
}

const DownloadCliWalkthrough = ({ finalStep = defaultFinalStep }): JSX.Element => {
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
      <Typography variant="h6">Install and Run</Typography>
      <NumberedSteps
        step={1}
        title="Download and install the CLI"
        description={
          <CopyToClipboard copyText={installCommand.copyText}>
            <CodeBlock>{installCommand.displayText}</CodeBlock>
          </CopyToClipboard>}
      />
      <NumberedSteps
        step={2}
        title="Run the CLI to prepare your node with required pre-requisites to be added to a Kubernetes cluster"
        description={
          <CopyToClipboard copyText="pf9ctl cluster prep-node">
            <CodeBlock>pf9ctl cluster prep-node</CodeBlock>
          </CopyToClipboard>
        }
      />
      <NumberedSteps
        step={3}
        {...finalStep}
      />
    </>
  )
}

interface NumberedStepProps {
  step: number
  title: string
  description: string | JSX.Element
}

const NumberedSteps = ({ step, title, description }: NumberedStepProps): JSX.Element => {
  const classes = useStyles({})
  return (
    <div className={classes.row}>
      <Typography variant="h6" className={classes.step}>
        {step}
      </Typography>
      <div>
        <Typography variant="subtitle2">{title}</Typography>
        {typeof description === 'string' ? (
          <Typography variant="body1">{description}</Typography>
        ) : (
          description
        )}
      </div>
    </div>
  )
}

export default DownloadCliWalkthrough
