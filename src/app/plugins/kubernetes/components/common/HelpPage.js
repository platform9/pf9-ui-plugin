import React from 'react'
import { Divider, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { publicSlackLink, supportEmail } from 'app/constants'
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'
import { pmkDocumentationLink } from 'k8s/links'

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
        Need help? You are currently using the free-tier account of Platform9 Managed Kubernetes
        (PMK). There are 2 ways to get help free tier account:
      </Typography>

      <Typography variant="h5">Documentation & Knowledge Base</Typography>
      <Typography variant="subtitle1" className={classes.text}>
        Use our documentation and knowledge base to get help with various product features and
        capabilities.
      </Typography>
      <Typography variant="subtitle1" className={classes.text}>
        Reference the PMK documentation at &nbsp;
        <ExternalLink url={pmkDocumentationLink} />
      </Typography>

      <Typography variant="h5">Support</Typography>
      <Typography variant="subtitle1" className={classes.text}>
        Use our public slack channel to ask questions. The channel url is: &nbsp;
        <ExternalLink url={publicSlackLink} />
      </Typography>
      <Typography variant="subtitle1" className={classes.text}>
        You should have received an invite to join the channel already. If you haven't, send a
        request to <SimpleLink href={`mailto:${supportEmail}`}>{supportEmail}</SimpleLink>
      </Typography>
    </>
  )
}

export default HelpPage
