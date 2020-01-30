import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { projectAs } from 'utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import MultiSelect from 'core/components/MultiSelect'
import { mngmUserActions } from 'k8s/components/userManagement/users/actions'

const UserMultiSelect = forwardRef(({ onChange, value, ...rest }, ref) => {
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list, { orderBy: 'username' })
  const usersList = projectAs({ label: 'username', value: 'username' }, users)

  return (
    <MultiSelect
      label="Users"
      options={usersList}
      values={value}
      onChange={onChange}
      loading={loadingUsers}
      {...rest}
    />
  )
})

UserMultiSelect.propTypes = {
  id: PropTypes.string.isRequired,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}
UserMultiSelect.displayName = 'UserMultiSelect'

export default withFormContext(UserMultiSelect)
