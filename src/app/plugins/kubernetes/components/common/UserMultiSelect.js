import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { projectAs, sortByProperty } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { mngmUserActions } from 'k8s/components/userManagement/users/actions'

const UserPicker = forwardRef(({ onChange, ...rest }, ref) => {
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const [values, setValues] = React.useState([])

  const handleValuesChange = values => {
    setValues(values)
    onChange && onChange(values)
  }

  const usersList = projectAs({ label: 'username', value: 'username' }, users)
  const sortedUsersList = sortByProperty(usersList, 'label')

  return (
    <MultiSelect
      label="Users"
      options={sortedUsersList}
      values={values}
      onChange={handleValuesChange}
      loading={loadingUsers}
      {...rest}
    />
  )
})

UserPicker.propTypes = {
  id: PropTypes.string.isRequired,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}
UserPicker.displayName = 'UserPicker'

export default UserPicker
