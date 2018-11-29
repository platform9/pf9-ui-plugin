import React from 'react'
import faker from 'faker'
import StarBorder from '@material-ui/icons/StarBorder'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import DraftsIcon from '@material-ui/icons/Drafts'
import DashboardIcon from '@material-ui/icons/Dashboard'
import CodeIcon from '@material-ui/icons/Code'
import BuildIcon from '@material-ui/icons/Build'
import TocIcon from '@material-ui/icons/Toc'
import SendIcon from '@material-ui/icons/Send'
import { randomItem } from '../helpers'

const icons = [
  <StarBorder />,
  <InboxIcon />,
  <DraftsIcon />,
  <DashboardIcon />,
  <CodeIcon />,
  <BuildIcon />,
  <TocIcon />,
  <SendIcon />,
]

const fakeNavbarItem = withIcons => () => ({
  name: faker.random.word(),
  link: {
    path: faker.internet.url()
  },
  icon: withIcons ? randomItem(icons) : null
})

export default fakeNavbarItem
