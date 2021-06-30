import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import ExternalLink from './ExternalLink'
import { pf9IdeasLink } from 'app/constants'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  root: {
    width: 800,
    border: `1px solid ${theme.palette.blue[500]}`,
    padding: theme.spacing(3.5, 5, 6),
    position: 'relative',
  },
  header: {
    color: theme.palette.pink[500],
  },
  title: {
    marginTop: theme.spacing(3),
  },
  copy: {
    marginTop: theme.spacing(2),
    lineHeight: 1.5,
  },
  ribbon: {
    width: 80,
    height: 120,
    borderRadius: '0px 4px 0px 0px',
    background: theme.palette.pink[500],
    top: theme.spacing(-1.5),
    right: theme.spacing(3.5),
    position: 'absolute',
    textAlign: 'center',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      borderStyle: 'solid',
      borderColor: `${theme.palette.pink[500]} ${theme.palette.pink[500]} ${theme.palette.grey['000']}`,
      borderWidth: `0px 40px 20px 40px`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: theme.spacing(-1),
      borderStyle: 'solid',
      borderColor: `${theme.palette.pink[700]} transparent`,
      borderWidth: theme.spacing(0, 0, 1.5, 1),
    },
  },
  flask: {
    marginTop: theme.spacing(2),
    width: 56,
  },
}))

interface Props {
  title: string
  copy: string
  headerText?: string
}

const IdeasComingSoon = ({ headerText = 'Ideas@Platform9', title = '', copy }: Props) => {
  const classes = useStyles({})
  return (
    <div className={classes.root}>
      <div className={classes.ribbon}>
        <img src="/ui/images/icon-flask@2x.png" className={classes.flask} />
      </div>
      <Text variant="subtitle1" className={classes.header}>
        {headerText}
      </Text>
      <Text variant="h3" className={classes.title}>
        {title}
      </Text>
      <Text variant="body1" className={classes.copy}>
        {copy}
        {'\n'}Visit the Platform9 Ideas Portal <ExternalLink url={pf9IdeasLink}>here</ExternalLink>{' '}
        to vote on what we build next.
      </Text>
    </div>
  )
}

export default IdeasComingSoon
