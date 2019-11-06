import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { projectAs } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { mngmUserActions } from 'k8s/components/userManagement/users/actions'

const UserPicker = forwardRef(({ onChange, ...rest }, ref) => {
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list, { orderBy: 'username' })
  const [values, setValues] = React.useState([])

  const handleValuesChange = values => {
    setValues(values)
    onChange && onChange(values)
  }

  const usersList = projectAs({ label: 'username', value: 'username' }, users)

  return (
    <MultiSelect
      label="Users"
      options={usersList}
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
