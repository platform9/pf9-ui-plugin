import React from 'react'
import { Dialog, makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import { keys } from 'ramda'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles<Theme>((theme) => ({
  outlinedButton: {
    background: theme.palette.grey['000'],
    color: theme.palette.blue[500],
  },
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogHeaderText: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridGap: theme.spacing(1),
    alignItems: 'center',
  },
  dialogContent: {
    margin: theme.spacing(3, 2),
  },
  resourcesList: {
    display: 'grid',
    gridGap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  resourceBox: {
    padding: theme.spacing(2, 3),
    background: theme.palette.blue[100],
    display: 'flex',
  },
  closeIcon: {
    color: theme.palette.blue[500],
    cursor: 'pointer',
  },
  middleDiv: {
    marginLeft: theme.spacing(1),
    minWidth: 200,
  },
  verb: {
    display: 'inline-block',
    background: theme.palette.blue[200],
    padding: theme.spacing(0.5, 2),
    borderRadius: 8,
    margin: theme.spacing(1),
    position: 'relative',
    top: theme.spacing(-0.5),
  },
}))

interface Props {
  rbac: any
  role: any
  onClose: () => void
}

const renderGroupResources = (group, rbac) => {
  const classes = useStyles({})
  const resources = keys(rbac[group])
  return (
    <div className={classes.resourcesList}>
      {resources.map((resource: string) => (
        <div key={`${group}-${resource}`} className={classes.resourceBox}>
          <div>
            <Text variant="body2">API Group:</Text>
            <Text variant="body2">Resources:</Text>
          </div>
          <div className={classes.middleDiv}>
            <Text variant="caption1">{group}</Text>
            <Text variant="caption1">{resource}</Text>
          </div>
          <div>
            {keys(rbac[group][resource]).map((verb: string) => (
              <div key={verb} className={classes.verb}>
                {verb}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const RoleAnalysisDialog = ({ rbac, role, onClose }: Props) => {
  const classes = useStyles({})
  const apiGroups = keys(rbac)

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose} className={classes.dialog}>
      <div className={classes.dialogContainer}>
        <div className={classes.dialogHeader}>
          <div className={classes.dialogHeaderText}>
            <Text variant="body1">Policy Details:</Text>
            <Text variant="subtitle2">{role.name}</Text>
          </div>
          <FontAwesomeIcon className={classes.closeIcon} size="xl" onClick={onClose}>
            times
          </FontAwesomeIcon>
        </div>
        <div className={classes.dialogContent}>
          {apiGroups.map((group) => renderGroupResources(group, rbac))}
        </div>
      </div>
    </Dialog>
  )
}

export default RoleAnalysisDialog
