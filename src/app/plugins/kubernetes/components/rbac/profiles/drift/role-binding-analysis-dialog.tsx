import React from 'react'
import { Dialog, makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ListTable from 'core/components/listTable/ListTable'

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
  role: {
    display: 'flex',
  },
  roleValue: {
    marginLeft: theme.spacing(7),
  },
}))

interface Props {
  roleBinding: any
  onClose: () => void
}

const columns = [
  { id: 'kind', label: 'Kind' },
  { id: 'name', label: 'Name' },
]

const RoleBindingAnalysisDialog = ({ roleBinding, onClose }: Props) => {
  const classes = useStyles({})
  console.log(roleBinding)

  return (
    <Dialog open fullWidth maxWidth="md" onClose={onClose} className={classes.dialog}>
      <div className={classes.dialogContainer}>
        <div className={classes.dialogHeader}>
          <div className={classes.dialogHeaderText}>
            <Text variant="body1">Policy Details:</Text>
            <Text variant="subtitle2">{roleBinding.name}</Text>
          </div>
          <FontAwesomeIcon className={classes.closeIcon} size="xl" onClick={onClose}>
            times
          </FontAwesomeIcon>
        </div>
        <div className={classes.dialogContent}>
          <div className={classes.role}>
            <Text variant="body2">{roleBinding.newValue.roleRef.kind}:</Text>
            <Text variant="body2" className={classes.roleValue}>
              {roleBinding.newValue.roleRef.name}
            </Text>
          </div>
        </div>
        <div>
          <div className={classes.dialogHeader}>
            <Text variant="body1">Subjects</Text>
          </div>
          <div className={classes.dialogContent}>
            <ListTable
              showCheckboxes={false}
              searchTargets={['name', 'kind']}
              columns={columns}
              data={roleBinding.newValue.subjects}
              rowsPerPage={10}
              uniqueIdentifier="name"
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default RoleBindingAnalysisDialog
