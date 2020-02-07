import React, { FC } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import SimpleLink from 'core/components/SimpleLink'
import ExternalLink from 'core/components/ExternalLink'
import { gettingStartedHelpLink } from 'k8s/links'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles<Theme>((theme) => ({
  onboardWizard: {
    padding: theme.spacing(1, 0, 3, 0),
  },
  ctaHeader: {
    padding: theme.spacing(4, 6),
    borderRadius: theme.spacing(),
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.2)',
    marginBottom: theme.spacing(2),
  },
  rightAlign: {
    minHeight: theme.spacing(5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    '& a:first-child': {
      marginRight: theme.spacing(2),
    },
  },
}))

export interface Props {
  title: string
  body: string
  renderLinks?: boolean
}

const OnboardWizard: FC<Props> = ({ title, body, children, renderLinks = true }) => {
  const { ctaHeader, onboardWizard, rightAlign } = useStyles({})

  return (
    <section className={onboardWizard}>
      {renderLinks && (
        <div className={rightAlign}>
          <SimpleLink src={routes.userManagement.users.path()} icon="user-plus">
            Invite Team Member
          </SimpleLink>
          <ExternalLink url={gettingStartedHelpLink} icon="file-alt">
            Setup Documentation
          </ExternalLink>
        </div>
      )}
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
