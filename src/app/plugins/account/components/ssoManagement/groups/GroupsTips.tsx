import React, { useState } from 'react'
import clsx from 'clsx'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import ExternalLink from 'core/components/ExternalLink'
import { ssoGroupsLink } from 'app/plugins/account/links'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Theme from 'core/themes/model'

const useStyles = makeStyles((theme: Theme) => ({
  caretIcon: {
    background: theme.palette.blue[500],
    borderRadius: '50%',
    display: 'inline-flex',
    height: 15,
    width: 15,
    alignItems: 'center',
    color: theme.palette.grey['000'],
    marginRight: theme.spacing(0.5),
    '& i': {
      position: 'relative',
      top: 1,
    },
  },
  verticallyCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  clickable: {
    cursor: 'pointer',
  },
  tipCard: {
    padding: theme.spacing(4, 3),
    display: 'grid',
    gridGap: theme.spacing(3),
  },
  tipLabel: {
    display: 'inline-block',
    marginBottom: theme.spacing(1),
  },
}))

const GroupsTips = () => {
  const classes = useStyles({})
  const [showTip, setShowTip] = useState(false)

  return (
    <FormFieldCard className={classes.tipCard}>
      <div>
        <Text variant="body2" className={classes.tipLabel}>
          SAML GROUPS
        </Text>
        <Text variant="body2">
          A Group is used to create a mapping between a set of users from an external identity
          provider such as SAML, LDAP, AD into Keystone.{' '}
          <ExternalLink url={ssoGroupsLink}>More info</ExternalLink>
        </Text>
      </div>
      <div>
        <Text
          variant="body2"
          className={clsx(classes.verticallyCenter, classes.clickable, classes.tipLabel)}
          onClick={() => setShowTip(!showTip)}
        >
          <span className={classes.caretIcon}>
            <FontAwesomeIcon size="sm">{showTip ? 'angle-up' : 'angle-down'}</FontAwesomeIcon>
          </span>
          TIPS
        </Text>
        {showTip && (
          <Text variant="body2">
            It is recommended that you configure your groups so that a user only maps to a single
            group. If a user maps to more than one group, that user will gain the tenant privileges
            granted to each group. For example, if Group 1 has Admin access to Tenant 1, and Group 2
            has Self-service access to both Tenant 1 and Tenant 2, a user that matches with both
            Group 1 and Group 2 will have Admin access to Tenant 1, and Self-service access to
            Tenant 2.
          </Text>
        )}
      </div>
    </FormFieldCard>
  )
}

export default GroupsTips
