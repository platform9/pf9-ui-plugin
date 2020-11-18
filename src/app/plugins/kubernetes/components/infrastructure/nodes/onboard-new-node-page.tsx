import React from 'react'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Tab from 'core/components/tabs/Tab'
// import { makeStyles } from '@material-ui/core'
// import Theme from 'core/themes/model'
import DownloadCliPage from './DownloadCliPage'
import Tabs from 'core/components/tabs/Tabs'
import DownloadHostAgentPage from './download-host-agent-page'
import SimpleLink from 'core/components/SimpleLink'
import { routes } from 'core/utils/routes'
import { makeStyles, Theme } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
  onBoardNodeContainer: {
    maxWidth: '850px',
  },
  backLink: {
    marginLeft: 'auto',
  },
  header: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'flex-end',
  },
}))

const OnboardNewNodePage = () => {
  const classes = useStyles()
  return (
    <PageContainer>
      <div className={classes.header}>
        <SimpleLink src={routes.nodes.list.path()} className={classes.backLink}>
          « Back to Node List
        </SimpleLink>
      </div>
      <Tabs>
        <Tab value="downloadCLI" label="Download PF9 CLI">
          <DownloadCliPage />
        </Tab>
        <Tab value="advanced" label="Advanced">
          <DownloadHostAgentPage />
        </Tab>
      </Tabs>
    </PageContainer>
  )
}

export default OnboardNewNodePage
