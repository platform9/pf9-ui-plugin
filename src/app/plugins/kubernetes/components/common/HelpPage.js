import React from 'react'
import { Divider, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CardButton from 'core/components/buttons/CardButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import {
  pmkCliOverviewLink,
  gettingStartedHelpLink,
  tutorialsHelpLink,
  slackLink,
  emailSupportLink,
  forumHelpLink,
} from 'k8s/links'
import ExternalLink from 'core/components/ExternalLink'
import clsx from 'clsx'
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

const SlackSVG = () => {
  const classes = useStyles()
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="slack-hash"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
      className={clsx(classes.svgIcon, 'svg-inline--fa fa-slack-hash fa-w-14 fa-3x')}
    >
      <path
        fill="currentColor"
        d="M446.2 270.4c-6.2-19-26.9-29.1-46-22.9l-45.4 15.1-30.3-90 45.4-15.1c19.1-6.2 29.1-26.8 23-45.9-6.2-19-26.9-29.1-46-22.9l-45.4 15.1-15.7-47c-6.2-19-26.9-29.1-46-22.9-19.1 6.2-29.1 26.8-23 45.9l15.7 47-93.4 31.2-15.7-47c-6.2-19-26.9-29.1-46-22.9-19.1 6.2-29.1 26.8-23 45.9l15.7 47-45.3 15c-19.1 6.2-29.1 26.8-23 45.9 5 14.5 19.1 24 33.6 24.6 6.8 1 12-1.6 57.7-16.8l30.3 90L78 354.8c-19 6.2-29.1 26.9-23 45.9 5 14.5 19.1 24 33.6 24.6 6.8 1 12-1.6 57.7-16.8l15.7 47c5.9 16.9 24.7 29 46 22.9 19.1-6.2 29.1-26.8 23-45.9l-15.7-47 93.6-31.3 15.7 47c5.9 16.9 24.7 29 46 22.9 19.1-6.2 29.1-26.8 23-45.9l-15.7-47 45.4-15.1c19-6 29.1-26.7 22.9-45.7zm-254.1 47.2l-30.3-90.2 93.5-31.3 30.3 90.2-93.5 31.3z"
        className=""
      />
    </svg>
  )
}

const SupportCard = ({ title, icon, body = '', src, action }) => {
  const classes = useStyles()
  return (
    <div className={classes.card}>
      <header className={classes.cardHeader}>
        <Typography variant="subtitle2" className={classes.title}>
          {title}
        </Typography>
        {icon === 'slack-hash' ? (
          <SlackSVG />
        ) : (
          <FontAwesomeIcon className={classes.icon}>{icon}</FontAwesomeIcon>
        )}
      </header>
      <article className={classes.cardBody}>
        <Typography variant="body1">{body}</Typography>
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
      <Typography variant="h6" className={classes.pageHeader}>
        Support
      </Typography>
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

      <Typography variant="h6" className={classes.pageHeader}>
        Have a question?
      </Typography>
      <Divider />
      <div className={classes.cardRow}>
        <SupportCard
          title="Reach out on Slack"
          icon="slack-hash"
          src={slackLink}
          action="Open Slack"
        />
        <SupportCard
          title="Send us an Email"
          icon="envelope"
          src={emailSupportLink}
          action="Send Email"
        />
        <SupportCard
          title="Join our Forums"
          icon="comments"
          src={forumHelpLink}
          action="Go to forum"
        />
      </div>
    </>
  )
}

export default HelpPage
