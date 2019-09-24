import React, { useMemo, forwardRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { head, isEmpty, propOr } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { repositoryActions } from './actions'
import { allKey } from 'app/constants'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const RepositoryPicklist = forwardRef(
  ({ loading, onChange, selectFirst, ...rest }, ref) => {
    const [repos, reposLoading] = useDataLoader(repositoryActions.list)
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
      onChange={onChange}
      loading={loading || reposLoading}
      options={options}
    />
  })

RepositoryPicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  selectFirst: PropTypes.bool,
}

RepositoryPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'repositoryId',
  label: 'Repository',
  formField: false,
  showAll: true,
  selectFirst: false,
}

export default RepositoryPicklist
