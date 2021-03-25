import React from 'react'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import Text from 'core/elements/text'

interface Props {
  items: Array<string | JSX.Element>
  type?: string
  className?: string
}

const useStyles = makeStyles<any, Partial<Props>>((theme: Theme) => ({
  ul: {
    padding: 0,
    margin: 0,
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(2),
    listStyleType: ({ type }) => (type === 'dash' ? '"-  "' : type),
  },
}))

export default ({ items = [], type = 'disc', className = undefined }: Props) => {
  const styles = useStyles({ type })
  return (
    <ul className={clsx(styles.ul, className)}>
      {items.map((item, idx) => (
        <li key={idx}>{typeof item === 'string' ? <Text variant="body2">{item}</Text> : item}</li>
      ))}
    </ul>
  )
}
