import React from 'react'
import Tab from 'core/components/tabs/Tab'
import DownloadCliPage from './DownloadCliPage'
import Tabs from 'core/components/tabs/Tabs'
import DownloadHostAgentPage from './download-host-agent-page'
import SimpleLink from 'core/components/SimpleLink'
import { routes } from 'core/utils/routes'
import { makeStyles, Theme } from '@material-ui/core'
import DownloadOvaPage from './download-ova-page'


const useStyles = makeStyles((theme: Theme) => ({
  onBoardNodeContainer: {
    display: 'grid',
    gridTemplateColumns: '850px 1fr',
  },
  backLink: {
    marginLeft: 'auto',
  },
}))

const OnboardNewNodePage = () => {
  const classes = useStyles()
  return (
    <div className={classes.onBoardNodeContainer}>
      <Tabs>
        <Tab value="vmTemplate" label="VM Template">
          <DownloadOvaPage/>
        </Tab>
        <Tab value="pf9CLI" label="PF9 CLI">
          <DownloadCliPage />
        </Tab>
        <Tab value="advanced" label="Advanced">
          <DownloadHostAgentPage />
        </Tab>
      </Tabs>
      <SimpleLink src={routes.nodes.list.path()} className={classes.backLink}>
        « Back to Node List
      </SimpleLink>
    </div>
  )
}

export default OnboardNewNodePage
