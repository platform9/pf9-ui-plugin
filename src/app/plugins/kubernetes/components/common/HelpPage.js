import React from 'react'
import { Divider } from '@material-ui/core'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import CardButton from 'core/components/buttons/CardButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import {
  pmkCliOverviewLink,
  gettingStartedHelpLink,
  tutorialsHelpLink,
  slackLink,
  forumHelpLink,
} from 'k8s/links'
import ExternalLink from 'core/components/ExternalLink'
import { hexToRGBA } from 'core/utils/colorHelpers'

const useStyles = makeStyles((theme) => ({
  pageHeader: {
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  title: {
    color: theme.palette.primary.main,
  },
  divider: {
    marginBottom: theme.spacing(2),
  },
  text: {
    margin: theme.spacing(2),
  },
  card: {
    minHeight: 160,
    borderRadius: theme.spacing(),
    boxShadow: '1px 1px 8px -4px rgba(0,0,0,0.5)',
    display: 'grid',
    gridTemplateRows: '60px 1fr',
    gridGap: '10px',
  },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 300px)',
    gridGap: theme.spacing(2),
    margin: theme.spacing(2),
  },
  cardHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
    border: `1px solid ${hexToRGBA(theme.palette.primary.main, 0.5)}`,
    borderRadius: theme.spacing(1, 1, 0, 0),
  },
  cardBody: {
    display: 'grid',
    padding: theme.spacing(0, 2, 2, 2),
    gridTemplateRows: '1fr 35px',
  },
  icon: {
    fontSize: theme.spacing(4),
    justifySelf: 'center',
    height: '28px',
    marginTop: '5px',
    color: theme.palette.primary.main,
  },
  svgIcon: {
    width: '30px',
    justifySelf: 'center',
    color: theme.palette.primary.main,
  },
}))

const brandIcons = ['slack-hash']

const SupportCard = ({ title, icon, body = '', src, action }) => {
  const classes = useStyles()
  return (
    <div className={classes.card}>
      <header className={classes.cardHeader}>
        <Text variant="subtitle2" className={classes.title}>
          {title}
        </Text>
        <FontAwesomeIcon brand={brandIcons.includes(icon)} className={classes.icon}>
          {icon}
        </FontAwesomeIcon>
      </header>
      <article className={classes.cardBody}>
        <Text variant="body1">{body}</Text>
        {src.indexOf('mailto') >= 0 ? (
          <a href={src}>
            <CardButton showPlus={false}>{action}</CardButton>
          </a>
        ) : (
          <ExternalLink url={src}>
            <CardButton showPlus={false}>{action}</CardButton>
          </ExternalLink>
        )}
      </article>
    </div>
  )
}

const HelpPage = () => {
  const classes = useStyles()
  return (
    <>
      <Text variant="h6" className={classes.pageHeader}>
        Support
      </Text>
      <Divider />
      <div className={classes.cardRow}>
        <SupportCard
          title="Getting Started"
          icon="play-circle"
          body="Need help with BareOS, AWS or Azure?"
          src={gettingStartedHelpLink}
          action="Getting Started"
        />
        <SupportCard
          title="CLI Guide"
          icon="file-code"
          body="Using the CLI to build a cluster?"
          src={pmkCliOverviewLink}
          action="View CLI Commands"
        />
        <SupportCard
          title="Tutorials"
          icon="drafting-compass"
          body="Need an end-to-end guide?"
          src={tutorialsHelpLink}
          action="View Tutorials"
        />
      </div>

      <Text variant="h6" className={classes.pageHeader}>
        Have a question?
      </Text>
      <Divider />
      <div className={classes.cardRow}>
        <SupportCard
          title="Join our Forums"
          icon="comments"
          src={forumHelpLink}
          action="Go to forum"
        />
        <SupportCard
          title="Reach out on Slack"
          icon="slack-hash"
          src={slackLink}
          action="Open Slack"
        />
      </div>
    </>
  )
}

export default HelpPage
