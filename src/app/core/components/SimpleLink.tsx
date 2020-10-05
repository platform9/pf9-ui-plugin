import React, { forwardRef, useCallback, ComponentType } from 'react'
import { Link } from '@material-ui/core'
import useReactRouter from 'use-react-router'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import FontAwesomeIcon from './FontAwesomeIcon'
import Theme from 'core/themes/model'

type ISimpleLinkVariant = 'error' | 'primary'

interface Props {
  src: string
  staticContext?: any
  className?: string
  icon?: string
  variant?: ISimpleLinkVariant
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}

const useStyles = makeStyles<Theme, { variant: ISimpleLinkVariant }>((theme) => ({
  root: {
    cursor: 'pointer',
    color: ({ variant }) =>
      variant === 'error' ? theme.components.error.main : theme.palette.primary.main,
  },
  icon: {
    marginRight: '6px',
  },
}))

// We need to destructure staticContext even though we are not using it in order to
// work around this issue: https://github.com/ReactTraining/react-router/issues/4683
// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const SimpleLink: ComponentType<Props> = forwardRef<HTMLElement, Props>(
  ({ onClick, src, children, staticContext, className, icon, variant, ...rest }, ref) => {
    const classes = useStyles({ variant })
    const { history } = useReactRouter()
    const handleClick = useCallback(
      (e) => {
        // Prevent links inside of a table row from triggering row selection.
        e.stopPropagation()
        if (onClick) {
          e.preventDefault()
          onClick(e)
        }
        // If there is no provided onClick, just use the `src` as a normal link.
        if (src && !src.startsWith('http')) {
          // local paths should use the History's push state
          e.preventDefault()
          return history.push(src)
        }
        // Any path that starts with http should be treated as an external link
      },
      [src, history],
    )

    return (
      <Link
        className={clsx(className, classes.root)}
        ref={ref}
        href={src || null}
        onClick={handleClick}
        {...rest}
      >
        {!!icon && <FontAwesomeIcon className={classes.icon}>{icon}</FontAwesomeIcon>}
        {children || src}
      </Link>
    )
  },
)

export default SimpleLink
