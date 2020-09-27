// Libs
import React, { FunctionComponent } from 'react'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
// Components
import PageContainer from 'core/components/pageContainer/PageContainer'
// import SimpleLink from 'core/components/SimpleLink'
import { DownloadCliOnboardNodeWalkthrough } from './DownloadCliWalkthrough'
import CopyToClipboard from 'core/components/CopyToClipboard'
import CodeBlock from 'core/components/CodeBlock'
import SimpleLink from 'core/components/SimpleLink'
import { routes } from 'core/utils/routes'
import Theme from 'core/themes/model'

const useStyles = makeStyles((theme: Theme) => ({
  onBoardNodeContainer: {
    maxWidth: '850px',
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
  const { spacer, backLink, onBoardNodeContainer } = useStyles({})
  return (
    <PageContainer
      className={onBoardNodeContainer}
      header={
        <SimpleLink src={routes.nodes.list.path()} className={backLink}>
          « Back to Node List
        </SimpleLink>
      }
    >
      <Text variant="h5">Onboard a new node</Text>
      <p> </p>
      <Text component="span">
        In order to add a physical or virtual node to your BareOS cluster, you need to first
        download and install the Platform9 CLI on that node. Follow the instructions below to
        download and install the CLI on your node
      </Text>
      <DownloadCliOnboardNodeWalkthrough />

      <p className={spacer} />
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
    </PageContainer>
  )
}
export default DownloadCliPage
