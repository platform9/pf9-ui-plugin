import React, { useMemo, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, omit } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { repositoryActions } from './actions'
import { allKey } from 'app/constants'

const RepositoryPicklist = forwardRef(
  ({ clusterId, loading, onChange, value, showNone, ...rest }, ref) => {
    const [repos, reposLoading] = useDataLoader(repositoryActions.list, { clusterId })
    const options = useMemo(() => projectAs(
      { label: 'name', value: 'id' }, repos,
    ), [repos])
    return <Picklist
      {...rest}
      ref={ref}
      showAll
      showNone={showNone}
      onChange={onChange}
      disabled={isEmpty(options) && !showNone}
      value={value || allKey}
      loading={loading || reposLoading}
      options={options}
    />
  })

RepositoryPicklist.propTypes = {
  ...omit(['options'], Picklist.propTypes),
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
}

RepositoryPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'clusterId',
  label: 'Current Repository',
  formField: false,
}

export default RepositoryPicklist
