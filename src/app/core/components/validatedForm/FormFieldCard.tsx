import React from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

export const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    borderRadius: 4,
    boxShadow: '0 2.5px 2.5px -1.5px rgba(0, 0, 0, 0.2), 0 1.5px 7px 1px rgba(0, 0, 0, 0.12), 0 4px 5px 0.5px rgba(0, 0, 0, 0.14)',
    padding: theme.spacing(3, 2),
    marginTop: theme.spacing(4),
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  requirementsTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.text.primary}`,
    padding: theme.spacing(1, 1, 1.5, 1),
    marginBottom: theme.spacing(1),
  },
}))

interface ContainerProps {
  title: string
  link?: JSX.Element
}
export const FormFieldCard: React.FC<ContainerProps> = ({ title, link = undefined, children }) => {
  const classes = useStyles({})
  return (
    <div className={classes.root}>
      <header className={classes.requirementsTitle}>
        <Typography variant="subtitle1">{title}</Typography>
        {!!link && link}
      </header>
      {children}
    </div>
  )
}
