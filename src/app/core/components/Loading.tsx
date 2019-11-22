import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import { SvgIconProps } from '@material-ui/core/SvgIcon'

const useStyles = makeStyles<Theme, { justify: string }>((theme: Theme) => ({
  flex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: ({ justify }) => justify || 'flex-start',
  },
  spacer: {
    width: theme.spacing(),
  },
  rotateContainer: {
    width: '22px',
    height: '22px',
  },
  rotate: {
    animation: '$spin 750ms infinite forwards',
  },
  rotateReverse: {
    animation: '$spinReverse 750ms infinite forwards',
  },
  '@keyframes spinReverse': {
    '0%': {
      transform: 'rotate(360deg)',
    },
    '100%': {
      transform: 'rotate(0deg)',
    },
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}))

interface Props extends SvgIconProps {
  children?: any
  loading?: boolean
  reverse?: boolean
  justify?: string
  icon: React.ComponentType<SvgIconProps>
}

const Loading = ({
  children,
  icon: IconComponent,
  loading = true,
  reverse = false,
  justify = undefined,
  ...iconProps
}: Props): JSX.Element => {
  const { rotate, rotateReverse, flex, spacer, rotateContainer } = useStyles({ justify })
  const rotateCls = reverse ? rotateReverse : rotate
  return (
    <div className={flex}>
      <div className={`${rotateContainer} ${loading ? rotateCls : ''}`}>
        <IconComponent {...iconProps} />
      </div>
      <span className={spacer} />
      {children}
    </div>
  )
}

export default Loading
