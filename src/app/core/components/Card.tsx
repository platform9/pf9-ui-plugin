import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import clsx from 'clsx'

const useStyles = makeStyles<Theme, Props>((theme) => ({
  apiCard: {
    opacity: 1,
    padding: theme.spacing(0, 8, 0, 8),
    marginRight: theme.spacing(2),
    userSelect: 'none',
    textAlign: 'center',
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: ({ active }) =>
      active ? `1px solid ${theme.palette.blue[500]}` : `solid 1px ${theme.palette.grey[300]}`,
    borderRadius: 4,
    backgroundColor: ({ active }) => (active ? theme.palette.blue[100] : theme.palette.grey['000']),
    width: 240,
    height: 124,
    '&:hover': {
      border: '1px solid #4aa3df',
    },
  },
}))

const Card: FC<Props> = (props) => {
  const { id, onClick, children, className = undefined } = props
  const classes = useStyles(props)

  const handleClick = () => {
    if (onClick) return onClick(id)
  }
  return (
    <div className={clsx(classes.apiCard, className)} onClick={handleClick}>
      {children}
    </div>
  )
}

interface Props {
  id: any
  onClick?: any
  active?: boolean
  className?: string
}

export default Card
