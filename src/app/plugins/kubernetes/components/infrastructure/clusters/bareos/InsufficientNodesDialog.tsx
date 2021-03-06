import React, { FC } from 'react'
import { Dialog, DialogActions, makeStyles } from '@material-ui/core'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { bareOSSetupDocumentationLink, pf9PmkArchitectureDigLink } from 'k8s/links'
import ExternalLink from 'core/components/ExternalLink'
import Text from 'core/elements/text'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Theme from 'core/themes/model'
import CopyToClipboard from 'core/components/CopyToClipboard'
import CodeBlock from 'core/components/CodeBlock'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { useSelector } from 'react-redux'
import { prop } from 'ramda'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { ClusterCreateTypeNames } from '../model'
import {
  configureCliCommand,
  downloadAndInstallPf9CliCommand,
  runPf9CliCommand,
} from '../constants'

const useStyles = makeStyles((theme: Theme) => ({
  formCard: {
    maxWidth: 'inherit',
  },
  icon: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  nodesInfo: {
    display: 'grid',
    gridTemplateColumns: 'minmax(min-content, 300px) 1fr',
    gridGap: theme.spacing(),
    margin: theme.spacing(2.5, 0, 0, 2),
    alignContent: 'center',
    justifyItems: 'start',
  },
  text: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(2),
  },
  linkText: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
  },
  stepHeader: {
    display: 'flex',
    margin: theme.spacing(1.5, 2, 0, 2),
  },
  stepDescription: {
    margin: theme.spacing(1, 1, 1.5, 4),
  },
  info: {
    margin: theme.spacing(1, 1, 1.5, 4),
  },
  dialogButtons: {
    justifyContent: 'flex-start',
    margin: theme.spacing(0, 2, 2, 2),
  },
}))

const InsufficientNodesNodesDialog = ({
  createType,
  availableNodes,
  requiredNodes,
  setRequiredNodes,
}) => {
  const classes = useStyles()
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)

  return (
    <Dialog fullWidth maxWidth="md" open={availableNodes < requiredNodes}>
      <FormFieldCard
        className={classes.formCard}
        title={
          <Text variant="body1" component="div">
            <FontAwesomeIcon className={classes.icon}>exclamation-circle</FontAwesomeIcon>
            {`Insufficient Nodes for ${ClusterCreateTypeNames[createType]} Cluster Configuration`}
          </Text>
        }
        link={
          <ExternalLink url={bareOSSetupDocumentationLink}>
            <Text variant="caption2">BareOS Cluster Help</Text>
          </ExternalLink>
        }
      >
        <Text variant="subtitle2" className={classes.text}>
          {`The available number of connected nodes is insufficient for a ${ClusterCreateTypeNames[createType]} Cluster. You
          will need to connect additional BareOS Nodes prior to creating a ${ClusterCreateTypeNames[createType]} Cluster.`}
        </Text>
        <div className={classes.nodesInfo}>
          <Text variant="body1">Number of available nodes:</Text>
          <Text variant="caption1">{availableNodes}</Text>
          <Text variant="body1">Number of required nodes:</Text>
          <Text variant="caption1">{requiredNodes}</Text>
        </div>
      </FormFieldCard>
      <FormFieldCard
        className={classes.formCard}
        title="Connect BareOs Nodes"
        link={
          <ExternalLink url={pf9PmkArchitectureDigLink}>
            <Text variant="caption2">See all the PF9CTL Options</Text>
          </ExternalLink>
        }
      >
        <Text variant="body1" className={classes.text}>
          Use the Platform9 CLI to connect nodes to the Platform9 Management Plane:
        </Text>
        <NumberedStep
          step={1}
          title="Download the CLI for each node"
          description={
            <CopyToClipboard copyText={downloadAndInstallPf9CliCommand}>
              <CodeBlock>{downloadAndInstallPf9CliCommand}</CodeBlock>
            </CopyToClipboard>
          }
        />
        <NumberedStep
          step={2}
          title="Configure the CLI"
          description={
            <CopyToClipboard copyText={configureCliCommand}>
              <CodeBlock>{configureCliCommand}</CodeBlock>
            </CopyToClipboard>
          }
        />
        <div className={classes.info}>
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
        </div>
        <NumberedStep
          step={3}
          title="Using a user with SUDO privileges, run the PF9 CLI command Prep-Node to attach the node to Platform9."
          description={
            <CopyToClipboard copyText={runPf9CliCommand}>
              <CodeBlock>{runPf9CliCommand}</CodeBlock>
            </CopyToClipboard>
          }
        />
      </FormFieldCard>
      <DialogActions className={classes.dialogButtons}>
        <SubmitButton onClick={() => setRequiredNodes(0)}>Close</SubmitButton>
      </DialogActions>
    </Dialog>
  )
}

interface NumberedStepProps {
  step: number
  title?: string
  description: string | JSX.Element
}

const NumberedStep: FC<NumberedStepProps> = ({
  step,
  title,
  description,
  children,
}): JSX.Element => {
  const classes = useStyles()
  return (
    <div>
      <div className={classes.stepHeader}>
        <Text variant="subtitle2">{`${step}. ${title}`}</Text>
      </div>
      <div className={classes.stepDescription}>
        {typeof description === 'string' ? <Text variant="body1">{description}</Text> : description}
        {children}
      </div>
    </div>
  )
}

export default InsufficientNodesNodesDialog
