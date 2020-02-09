import React, { FC } from 'react'
import { Tooltip } from '@material-ui/core'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/styles'
import SimpleLink from './SimpleLink'
import Theme from 'core/themes/model'
import { TooltipProps } from '@material-ui/core/Tooltip'

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
  placement = 'bottom',
  icon = 'question-circle',
  color = 'white',
  link = undefined,
}) => {
  const classes = useStyles({ color, isLink: !!link })

  const content = link ? (
    <SimpleLink src={link}>
      <FontAwesomeIcon className={classes.icon}>{icon}</FontAwesomeIcon>
    </SimpleLink>
  ) : (
    <FontAwesomeIcon className={classes.icon}>{icon}</FontAwesomeIcon>
  )

  return (
    <Tooltip title={title} placement={placement}>
      {content}
    </Tooltip>
  )
}

export default HelpContainer
