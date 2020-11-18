import React from 'react'
import PageContainer from 'core/components/pageContainer/PageContainer'
import Tab from 'core/components/tabs/Tab'
// import { makeStyles } from '@material-ui/core'
// import Theme from 'core/themes/model'
import DownloadCliPage from './DownloadCliPage'
import Tabs from 'core/components/tabs/Tabs'
import DownloadHostAgentPage from './download-host-agent-page'

// const useStyles = makeStyles((theme: Theme) => ({
//   onBoardNodeContainer: {
//     maxWidth: '850px',
//   },
//   backLink: {
//     marginLeft: 'auto',
//   },
// }))

const OnboardNewNodePage = () => {
  // const classes = useStyles()
  return (
    <PageContainer
    // header={
    //   <SimpleLink src={routes.nodes.list.path()} className={classes.backLink}>
    //     « Back to Node List
    //   </SimpleLink>
    // }
    >
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
