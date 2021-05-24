import React, { FC } from 'react'
import { Paper } from '@material-ui/core'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { hexToRgbaCss } from 'core/utils/colorHelpers'
import { sessionStoreKey, SessionState } from 'core/session/sessionReducers'
import { prop } from 'ramda'
import { useSelector } from 'react-redux'
import ExternalLink from 'core/components/ExternalLink'
import { nodePrerequisitesDocumentationLink, pmkCliOverviewLink } from 'k8s/links'
import {
  configureCliCommand,
  downloadAndInstallPf9CliCommand,
  runPf9CliCommand,
} from '../clusters/constants'
import Info from 'core/components/validatedForm/Info'

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2, 8),
    margin: theme.spacing(2, 0),
    backgroundColor: hexToRgbaCss(theme.palette.primary.main, 0.1),
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
  headerDiv: {
    marginTop: theme.spacing(2),
  },
  externalLink: {
    float: 'right',
    margin: theme.spacing(1),
  },
  collapsedContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    marginLeft: theme.spacing(2),
  },
}))

export const OsRequirements = () => {
  const classes = useStyles()
  return (
    <Info title="OS Requirements" expanded={false}>
      <div className={classes.collapsedContainer}>
        <div className={classes.headerDiv}>
          <ExternalLink
            className={classes.externalLink}
            url={nodePrerequisitesDocumentationLink}
            icon="file-alt"
          >
            Pre-requisites Documentation
          </ExternalLink>
        </div>
        <p>
          <Text component="span">
            You will need a physical or virtual machine with Ubuntu (18.04/20.04) or CentOS (7.X)
            installed.
          </Text>
        </p>
      </div>
    </Info>
  )
}

export const CliAdvancedOptions = () => {
  const classes = useStyles()
  return (
    <Info title="CLI Advanced Options" expanded={false}>
      <div className={classes.collapsedContainer}>
        <div className={classes.headerDiv}>
          <ExternalLink className={classes.externalLink} url={pmkCliOverviewLink} icon="file-alt">
            Learn more about PF9CTL
          </ExternalLink>
          <Text component="p" variant="subtitle2">
            Create clusters and more directly using the CLI
          </Text>
        </div>
        <p className={classes.spacer} />
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
      </div>
    </Info>
  )
}

const DownloadCliWalkthrough = (): JSX.Element => {
  const classes = useStyles({})
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)
  return (
    <Paper className={classes.paper} elevation={0}>
      <Text variant="h6">Use the PF9 CLI to connect nodes to the Platform9 Management Plane</Text>
      <NumberedSteps
        step={1}
        title="Download the CLI for each node"
        description={
          <CopyToClipboard copyText={downloadAndInstallPf9CliCommand}>
            <CodeBlock>{downloadAndInstallPf9CliCommand}</CodeBlock>
          </CopyToClipboard>
        }
      />
      <NumberedSteps
        step={2}
        title="Configure the CLI"
        description={
          <CopyToClipboard copyText={configureCliCommand}>
            <CodeBlock>{configureCliCommand}</CodeBlock>
          </CopyToClipboard>
        }
      />
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
      <NumberedSteps
        step={3}
        title={
          'Using a user with SUDO privileges, run the PF9 CLI command Prep-Node to attach the node to Platform9.'
        }
        description={
          <CopyToClipboard copyText={runPf9CliCommand}>
            <CodeBlock>{runPf9CliCommand}</CodeBlock>
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
      <Text variant="subtitle2">{title}</Text>
      <div className={classes.row}>
        <Text variant="body1" className={classes.step}>
          {step}
        </Text>
        {typeof description === 'string' ? <Text variant="body1">{description}</Text> : description}
        {children}
      </div>
    </div>
  )
}

export default DownloadCliWalkthrough
