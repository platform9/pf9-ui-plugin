import React, { FC } from 'react'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { TooltipProps } from '@material-ui/core/Tooltip'
import { Tooltip } from './Tooltip'
import ExternalLink from './ExternalLink'

interface Props {
  title?: string
  placement?: TooltipProps['placement']
  icon?: string
  color?: 'white' | 'black'
  link?: string
}

type IIconColor = Props['color']

const useStyles = makeStyles<Theme, { color: IIconColor; isLink: boolean }>((theme: Theme) => ({
  icon: {
    cursor: ({ isLink }) => (isLink ? 'pointer' : 'default'),
    fontWeight: 900,
    color: ({ color }) => theme.palette.common[color],
  },
}))

const HelpContainer: FC<Props> = ({
  title = 'Help',
  icon = 'question-circle',
  color = 'white',
  link = undefined,
}) => {
  const classes = useStyles({ color, isLink: !!link })

  const content = link ? (
    <ExternalLink url={link}>
      <FontAwesomeIcon className={classes.icon}>{icon}</FontAwesomeIcon>
    </ExternalLink>
  ) : (
    <FontAwesomeIcon className={classes.icon}>{icon}</FontAwesomeIcon>
  )

  return <Tooltip message={title}>{content}</Tooltip>
}

export default HelpContainer
