import React, { useCallback, useState } from 'react'
// import { projectAs } from 'utils/fp'
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'
import { apiGroupsLoader } from 'k8s/components/rbac/actions'
import Checkbox from 'core/components/Checkbox'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import withFormContext from 'core/components/validatedForm/withFormContext'
import { compose } from 'app/utils/fp'
import { assocPath, dissocPath, hasPath, curry, ifElse } from 'ramda'
import { emptyObj } from 'utils/fp'
import Progress from 'core/components/progress/Progress'

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    borderBottom: '1px solid #aaa',
    paddingBottom: '2px',
    marginBottom: '5px',
  },
  group: {
    display: 'flex',
  },
  groupHeader: {
    flexGrow: 0,
    minWidth: '200px',
  },
  groupColumn: {
    flexGrow: 0,
    minWidth: '200px',
    fontWeight: '600',
  },
  resource: {
    marginBottom: '10px',
  },
  resourceName: {
    fontWeight: '600',
  },
}))

const RbacChecklist = ({ clusterId, onChange, value, ...rest }) => {
  const [checkedItems, setCheckedItems] = useState(emptyObj)
  const [apiGroups, loadingApiGroups] = useDataLoader(apiGroupsLoader, { clusterId, orderBy: 'name' })

  const classes = useStyles()

  // Todo: how to reset checkedItems upon clusterId update?
  const handleCheck = useCallback((group, resource, verb) => {
    const path = [group, resource, verb]
    const newCheckedItems = ifElse(
      hasPath(path),
      dissocPath(path),
      assocPath(path, true)
    )(checkedItems)
    setCheckedItems(newCheckedItems)
    onChange(newCheckedItems)
  }, [checkedItems])

  const renderVerb = useCallback(curry((groupName, resourceName, verb) =>
    <FormControlLabel
      key={verb}
      control={
        <Checkbox
          checked={hasPath([groupName, resourceName, verb], checkedItems)}
          onChange={(e) => handleCheck(groupName, resourceName, verb)}
        />
      }
      label={verb}
    />), [handleCheck, checkedItems])

  // Tried to separate out each map into its own function, but it
  // does not work for some reason... had to put it all into
  // this one function for it to work.
  const renderApiGroup = (group) => {
    const renderGroupVerbs = renderVerb(group.name)
    return (
      <div key={group.name} className={classes.group}>
        <div className={classes.groupColumn}>{group.name}</div>
        <div className={classes.resources}>
          {group.resources.map(resource => {
            const renderResourceVerbs = renderGroupVerbs(resource.name)
            return <div key={resource.name} className={classes.resource}>
              <div className={classes.resourceName}>{resource.name}</div>
              <FormGroup row>
                {resource.verbs.map(renderResourceVerbs)}
              </FormGroup>
            </div>
          })}
        </div>
      </div>
    )
  }

  return (
    <Progress loading={loadingApiGroups} renderContentOnMount inline>
      <div className={classes.header}>
        <div className={classes.groupHeader}>API Group</div>
        <div>Resources</div>
      </div>
      {apiGroups.map(renderApiGroup)}
    </Progress>
  )
}

RbacChecklist.propTypes = {
  clusterId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

export default compose(
  withFormContext,
)(RbacChecklist)
