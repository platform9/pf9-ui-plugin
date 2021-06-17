import React from 'react'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import clsx from 'clsx'

interface ContainerProps {
  title?: string | JSX.Element
  link?: JSX.Element
  topContent?: JSX.Element
  className?: string
  maxWidth?: number
  inputsWidth?: number
  middleHeader?: JSX.Element
}
const defaultMaxWidth = 932

export const useStyles = makeStyles<Theme, ContainerProps>((theme) => ({
  root: {
    maxWidth: ({ maxWidth = defaultMaxWidth }) => maxWidth,
    borderRadius: 4,
    background: theme.palette.grey['000'],
    padding: theme.spacing(2, 3),
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    color: theme.palette.grey[700],
  },
  inputWidth: {
    maxWidth: ({ maxWidth = defaultMaxWidth, inputsWidth = maxWidth / 2 }) => inputsWidth,
    marginBottom: theme.spacing(3),
  },
  requirementsTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  title: {
    width: '55%',
    color: theme.palette.common.black,
  },
  titleRight: {
    width: '45%',
    display: 'grid',
    gridTemplateColumns: '1fr max-content',
    gridGap: theme.spacing(1),
    color: theme.palette.grey[700],
  },
}))

export const FormFieldCard: React.FC<ContainerProps> = (props) => {
  const { title, topContent, middleHeader, link, className, children } = props
  const classes = useStyles(props)
  return (
    <div className={clsx(classes.root, className)}>
      {(title || link) && (
        <header className={classes.requirementsTitle}>
          <div className={classes.title}>{!!title && <Text variant="body1">{title}</Text>}</div>
          <div className={classes.titleRight}>
            <div>{!!middleHeader && middleHeader}</div>
            <div>{!!link && link}</div>
          </div>
        </header>
      )}
      {topContent}
      {children}
    </div>
  )
}
