import React from 'react'
import { Typography, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
  text: {
    margin: theme.spacing(2),
  },
}))

const HelpPage = () => {
  const classes = useStyles()
  return (
    <>
      <Typography variant="h5" className={classes.title}>
        Support
      </Typography>
      <Divider />
      <Typography variant="subtitle1" className={classes.text}>
        Need help?  You are currently using the free-tier account of Platform9 Managed Kubernetes (PMK).
        There are 2 ways to get help free tier account:
      </Typography>

      <Typography variant="h5">Documentation & Knowledge Base</Typography>
      <Typography variant="subtitle1" className={classes.text}>
        Use our documentation and knowledge base to get help with various product features and capabilities.
      </Typography>
      <Typography variant="subtitle1" className={classes.text}>
        Reference the PMK documentation at
        &nbsp;<ExternalLink url="https://docs.platform9.com/kubernetes/overview/">https://docs.platform9.com/kubernetes/overview/</ExternalLink>
      </Typography>

      <Typography variant="h5">Support</Typography>
      <Typography variant="subtitle1" className={classes.text}>
        Use our public slack channel to ask questions. The channel url is:
        &nbsp;<ExternalLink url="https://kplane.slack.com">kplane.slack.com</ExternalLink>
      </Typography>
      <Typography variant="subtitle1" className={classes.text}>
        You should have received an invite to join the channel already.  If you haven't, send a
        request to <SimpleLink href="mailto:support-ft@platform9.com">support-ft@platform9.com</SimpleLink>
      </Typography>
    </>
  )
}

export default HelpPage
