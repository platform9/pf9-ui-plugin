import React, { FC, useState, useCallback, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import { apiGroupsLoader } from 'k8s/components/rbac/actions'
import Checkbox from 'core/components/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import withFormContext from 'core/components/validatedForm/withFormContext'
import { compose } from 'app/utils/fp'
import { assocPath, dissocPath, hasPath, ifElse, pluck, identity } from 'ramda'
import { emptyObj } from 'utils/fp'
import Progress from 'core/components/progress/Progress'
import setRbacObject from './setRbacObject'
import Theme from 'core/themes/model'
import { IRbacAPIGroupResourceVerb, IRbacAPIGroup, IRbacAPIGroupResource } from './model'
import { IUseDataLoader } from '../infrastructure/nodes/model'
import PicklistDefault from 'core/components/Picklist'
import { Chip } from '@material-ui/core'
import Text from 'core/elements/text'
import { hexToRGBA } from 'core/utils/colorHelpers'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

interface IApiGroupWithRoles {
  [apiGroup: string]: IApiGroupResource
}
interface IApiGroupResource {
  [resourceName: string]: IApiGroupResourceVerbs
}
type IApiGroupResourceVerbs = { [key in IRbacAPIGroupResourceVerb]: boolean }
interface IRbacChecklistState {
  group: string
  resource: string
}

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    margin: theme.spacing(0, 1),
  },
  header: {
    display: 'flex',
    borderBottom: '1px solid #aaa',
    paddingBottom: '2px',
    marginBottom: '5px',
  },
  group: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridGap: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  groupColumn: {
    flexGrow: 0,
    minWidth: '200px',
    fontWeight: 600,
  },
  resource: {
    display: 'grid',
    gridGap: theme.spacing(),
  },
  resourceGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 8px',
  },
  resourceName: {
    fontWeight: 600,
  },
  verbs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 140px)',
  },
  groupHeader: {
    fontSize: theme.spacing(2),
  },
  verbContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr) 8px',
    alignItems: 'center',
    justifyItems: 'center',
  },
  spacer: {
    margin: theme.spacing(2, 0),
  },
  icon: {
    justifySelf: 'center',
    alignSelf: 'center',
    cursor: 'pointer',
  },
  actionColumn: {
    display: 'grid',
  },
  selectedGroup: {
    marginBottom: theme.spacing(),
    display: 'grid',
    gridTemplateColumns: '1fr 40px',
    background: hexToRGBA(theme.palette.primary.main, 0.1),
    padding: theme.spacing(1, 2),
    borderRadius: '4px',
    border: '1px solid rgba(74, 163, 223, 0.5)',
  },
}))

const RbacChecklist = ({ clusterId, onChange, value, initialRules, ...rest }) => {
  const classes = useStyles({})
  const [editingGroup, setEditingGroup] = useState<IRbacChecklistState>(null)
  const [checkedItems, setCheckedItems] = useState<IApiGroupWithRoles>(emptyObj)

  const [apiGroups, loadingApiGroups]: IUseDataLoader<IRbacAPIGroup> = useDataLoader(
    apiGroupsLoader,
    {
      clusterId,
      orderBy: 'name',
    },
  ) as any

  useEffect(() => {
    if (!initialRules || !apiGroups || !apiGroups.length) {
      return
    }
    const rules = setRbacObject(initialRules, apiGroups)
    setCheckedItems(rules)
    onChange(rules)
  }, [initialRules, apiGroups])

  const handleCheck = useCallback(
    (group, resource, verb) => {
      const path = [group, resource, verb]
      const newCheckedItems = ifElse(
        hasPath(path),
        dissocPath(path),
        assocPath(path, true),
      )(checkedItems)
      setCheckedItems(newCheckedItems)
      onChange(newCheckedItems)
    },
    [checkedItems],
  )

  const handleDelete = useCallback(
    (group, resource) => {
      const path = [group, resource]
      const newCheckedItems = ifElse(hasPath(path), dissocPath(path), identity)(checkedItems)
      setCheckedItems(newCheckedItems)
      onChange(newCheckedItems)
    },
    [checkedItems],
  )

  return (
    <Progress loading={loadingApiGroups} renderContentOnMount inline>
      <div className={classes.container}>
        <AddRbacApiGroup
          groups={apiGroups}
          selectedItems={checkedItems}
          onChange={handleCheck}
          editGroup={editingGroup}
        />
        <hr className={classes.spacer} />
        <SelectedRbacApiGroups
          groups={checkedItems}
          onEdit={setEditingGroup}
          onDelete={handleDelete}
        />
      </div>
    </Progress>
  )
}

interface IAddRbacApiGroupProps {
  groups: IRbacAPIGroup[]
  selectedItems: IApiGroupWithRoles
  editGroup: IRbacChecklistState
  onChange: (group: string, resource: string, verb: string) => void
}

const AddRbacApiGroup: FC<IAddRbacApiGroupProps> = ({
  groups,
  selectedItems,
  onChange,
  editGroup,
}) => {
  const groupRef = useRef()
  const resourceRef = useRef()
  const classes = useStyles({})

  const [selectedGroup, setSelectedGroup] = useState<IRbacAPIGroup>(emptyObj as any)
  const [selectedResource, setSelectedResource] = useState<IRbacAPIGroupResource>(emptyObj as any)

  useEffect(() => {
    if (!editGroup) return
    if (editGroup.group && editGroup.resource) {
      const selectedApiGroup: IRbacAPIGroup =
        groups.find((group) => group.name === editGroup.group) || ({} as any)
      const selectedApiGroupResource = (selectedApiGroup.resources || []).find(
        (resource) => resource.name === editGroup.resource,
      )
      setSelectedGroup(selectedApiGroup || ({} as any))
      setSelectedResource(selectedApiGroupResource || ({} as any))
    }
  }, [editGroup])

  useEffect(() => {
    if (groups.length === 0) {
      return
    }
    if (!selectedGroup.name || !selectedGroup.resources.length) {
      const selectedApiGroup = groups[0]
      const selectedGroupResource = (selectedApiGroup.resources || [])[0]

      setSelectedGroup(selectedApiGroup)
      setSelectedResource(selectedGroupResource)
    }
  }, [groups, selectedGroup])

  const handleGroupChange = (value) => {
    const selectedApiGroup = groups.find((group) => group.name === value)
    const selectedGroupResource = (selectedApiGroup.resources || [])[0]
    setSelectedGroup(selectedApiGroup)
    setSelectedResource(selectedGroupResource)
  }
  const handleResourceChange = (value) => {
    const selectedGroupResource = (selectedGroup.resources || []).find(
      (resource) => resource.name === value,
    )
    setSelectedResource(selectedGroupResource || ({} as any))
  }

  const groupOptions = pluck('name', groups)
  const resourceOptions = pluck('name', selectedGroup.resources || [])
  const verbs = selectedResource && selectedResource.verbs ? selectedResource.verbs : []
  return (
    <>
      <div className={classes.group}>
        <Picklist
          ref={groupRef}
          label="API Group"
          name="selectedGroup"
          value={selectedGroup.name}
          onChange={handleGroupChange}
          options={groupOptions}
          showAll={false}
        />
        <Picklist
          ref={resourceRef}
          label="Resources"
          name="selectedResource"
          value={selectedResource?.name}
          onChange={handleResourceChange}
          options={resourceOptions}
          showAll={false}
        />
      </div>
      <Text variant="subtitle2">Choose which verbs to add to this resource</Text>
      <div className={classes.verbs}>
        {verbs.map((verb) => (
          <FormControlLabel
            key={verb}
            control={
              <Checkbox
                checked={hasPath([selectedGroup.name, selectedResource.name, verb], selectedItems)}
                onChange={() => onChange(selectedGroup.name, selectedResource.name, verb)}
              />
            }
            label={verb}
          />
        ))}
      </div>
    </>
  )
}

interface ISelectedRbacApiGroupProps {
  groups: IApiGroupWithRoles
  onEdit: (params: IRbacChecklistState) => void
  onDelete: (group: string, resource: string) => void
}
const SelectedRbacApiGroups: FC<ISelectedRbacApiGroupProps> = ({ groups, onEdit, onDelete }) => {
  const classes = useStyles({})
  return (
    <>
      {Object.entries(groups).map(([group, resources = {}]) => (
        <div key={group}>
          {Object.entries(resources).map(([resource, verbs = {}]) => {
            return (
              <div key={`${group}-${resource}`} className={classes.selectedGroup}>
                <div className={classes.resource}>
                  <div className={classes.resourceGroup}>
                    <Text variant="body1" className={classes.groupHeader}>
                      {group}
                    </Text>
                    <Text variant="body1">{resource}</Text>
                  </div>
                  <div className={classes.verbContainer}>
                    {Object.entries(verbs).map(([verb, value]) =>
                      value ? <Chip key={`${group}-${resource}-${verb}`} label={verb} /> : null,
                    )}
                  </div>
                </div>
                <div className={classes.actionColumn}>
                  <FontAwesomeIcon
                    className={classes.icon}
                    onClick={() => onDelete(group, resource)}
                  >
                    times
                  </FontAwesomeIcon>
                  <FontAwesomeIcon
                    className={classes.icon}
                    onClick={() => onEdit({ group, resource })}
                  >
                    pen
                  </FontAwesomeIcon>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}

export default compose(withFormContext)(RbacChecklist)
