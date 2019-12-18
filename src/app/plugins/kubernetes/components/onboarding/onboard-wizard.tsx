import React, { FC } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  onboardWizard: {
    padding: theme.spacing(3, 0),
  },
  ctaHeader: {
    padding: theme.spacing(4, 6),
    borderRadius: theme.spacing(),
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.2)',
    marginBottom: theme.spacing(2),
  },
}))

export interface Props {
  title: string
  body: string
}

const OnboardWizard: FC<Props> = ({ title, body, children }) => {
  const { ctaHeader, onboardWizard } = useStyles({})
  return (
    <section className={onboardWizard}>
      <header className={ctaHeader}>
        <Typography variant="h6">{title}</Typography>
        <p> </p>
        <Typography variant="body1">{body}</Typography>
      </header>
      {children}
    </section>
  )
}

export default OnboardWizard
