import Text from 'core/elements/text'
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  profileSummaryBox: {
    borderRadius: 4,
    background: theme.palette.grey['000'],
    padding: theme.spacing(2, 3),
    display: 'flex',
    flexFlow: 'column nowrap',
    color: theme.palette.grey[700],
    margin: theme.spacing(0, 2),
    minWidth: 300,
    '& > h6': {
      marginBottom: theme.spacing(2),
    },
    '& > p': {
      margin: theme.spacing(1, 0),
    },
    '& > p > strong': {
      float: 'right',
    },
  },
}))

const ProfileSummaryBox = ({
  profileName,
  baseCluster,
  roles,
  clusterRoles,
  roleBindings,
  clusterRoleBindings,
}) => {
  const classes = useStyles()
  return (
    <div className={classes.profileSummaryBox}>
      <Text variant="subtitle2">Profile Summary</Text>
      <p>
        Profile Name: <strong>{profileName}</strong>
      </p>
      <p>
        Base Cluster: <strong>{baseCluster}</strong>
      </p>
      <br />
      <p>
        Total Roles: <strong>{Object.keys(roles).length || ''}</strong>
      </p>
      <p>
        Total Cluster Roles: <strong>{Object.keys(clusterRoles).length || ''}</strong>
      </p>
      <p>
        Total Role Bindings: <strong>{Object.keys(roleBindings).length || ''}</strong>
      </p>
      <p>
        Total Cluster Role Bindings:{' '}
        <strong>{Object.keys(clusterRoleBindings).length || ''}</strong>
      </p>
    </div>
  )
}

export default ProfileSummaryBox
