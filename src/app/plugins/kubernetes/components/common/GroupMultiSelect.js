import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { projectAs } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { mngmGroupActions } from 'k8s/components/userManagement/groups/actions'

const GroupPicker = forwardRef(({ onChange, ...rest }, ref) => {
  const [groups, loadingGroups] = useDataLoader(mngmGroupActions.list, { orderBy: 'name' })
  const [values, setValues] = React.useState([])

  const handleValuesChange = values => {
    setValues(values)
    onChange && onChange(values)
  }

  const groupsList = projectAs({ label: 'name', value: 'name' }, groups)

  return (
    <MultiSelect
      label="Groups"
      options={groupsList}
      values={values}
      onChange={handleValuesChange}
      loading={loadingGroups}
      {...rest}
    />
  )
})

GroupPicker.propTypes = {
  id: PropTypes.string.isRequired,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}
GroupPicker.displayName = 'GroupPicker'

export default GroupPicker
