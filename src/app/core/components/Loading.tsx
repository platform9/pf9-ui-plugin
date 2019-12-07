import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import clsx from 'clsx'

interface IStyles {
  iconColor: 'primary' | 'secondary' | 'disabled'
  justify: string
  clickable: boolean
  reverse: boolean
}

const useStyles = makeStyles<Theme, IStyles>((theme: Theme) => ({
  flex: {
    display: 'flex',
    flexDirection: ({ reverse }) => (reverse ? 'row-reverse' : 'row'),
    alignItems: 'center',
    justifyContent: ({ justify }) => justify || 'flex-start',
  },
  spacer: {
    width: theme.spacing(0.5),
  },
  rotateContainer: {
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: ({ clickable }) => (clickable ? 'pointer' : 'default'),
  },
  icon: {
    color: ({ iconColor }) => theme.palette.text[iconColor],
  },
}))

interface Props {
  color?: 'primary' | 'secondary' | 'disabled'
  children?: any
  loading?: boolean
  reverse?: boolean
  justify?: string
  onClick?: () => void
}

const Loading = ({
  children,
  loading = true,
  reverse = false,
  justify = undefined,
  color = 'primary',
  onClick = undefined,
}: Props): JSX.Element => {
  const { flex, spacer, rotateContainer, icon } = useStyles({
    justify,
    clickable: !!onClick,
    iconColor: color,
    reverse,
  })
  return (
    <div className={flex}>
      <div className={rotateContainer} onClick={onClick}>
        <i className={clsx({ 'fa-spin': loading }, icon, 'fal fa-md fa-sync')} />
      </div>
      <span className={spacer} />
      {children}
    </div>
  )
}

export default Loading
