import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { projectAs } from 'utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { mngmGroupActions } from 'k8s/components/userManagement/groups/actions'

const GroupMultiSelect = forwardRef(({ onChange, value, ...rest }, ref) => {
  const [groups, loadingGroups] = useDataLoader(mngmGroupActions.list, { orderBy: 'name' })
  const groupsList = projectAs({ label: 'name', value: 'name' }, groups)

  return (
    <MultiSelect
      label="Groups"
      options={groupsList}
      values={value}
      onChange={onChange}
      loading={loadingGroups}
      {...rest}
    />
  )
})

GroupMultiSelect.propTypes = {
  id: PropTypes.string.isRequired,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}
GroupMultiSelect.displayName = 'GroupMultiSelect'

export default withFormContext(GroupMultiSelect)
