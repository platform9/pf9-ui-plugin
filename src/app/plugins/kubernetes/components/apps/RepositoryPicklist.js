import React, { useMemo, forwardRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { head, isEmpty, omit, propOr } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { repositoryActions } from './actions'
import { allKey } from 'app/constants'

const RepositoryPicklist = forwardRef(
  ({ clusterId, loading, onChange, value, showAll, showNone, selectFirst, ...rest }, ref) => {
    const [repos, reposLoading] = useDataLoader(repositoryActions.list, { clusterId })
    const options = useMemo(() => projectAs(
      { label: 'name', value: 'id' }, repos,
    ), [repos])
    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (!isEmpty(options) && selectFirst) {
        onChange(propOr(allKey, 'value', head(options)))
      }
    }, [options])
    return <Picklist
      {...rest}
      ref={ref}
      showAll={showAll}
      showNone={showNone}
      onChange={onChange}
      disabled={isEmpty(options) && !showNone}
      value={value || (showAll ? allKey : '')}
      loading={loading || reposLoading}
      options={options}
    />
  })

RepositoryPicklist.propTypes = {
  ...omit(['options'], Picklist.propTypes),
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  selectFirst: PropTypes.bool,
}

RepositoryPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'clusterId',
  label: 'Repository',
  formField: false,
  showAll: true,
  selectFirst: false,
}

export default RepositoryPicklist
