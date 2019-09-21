import React, { forwardRef, useMemo, useEffect } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import namespaceActions from 'k8s/components/namespaces/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const NamespacePicklist = forwardRef(
  ({ clusterId, loading, onChange, selectFirst, ...rest }, ref) => {
    const [namespaces, namespacesLoading] = useDataLoader(namespaceActions.list, { clusterId })
    const options = useMemo(() => projectAs(
      { label: 'name', value: 'name' }, namespaces,
    ), [namespaces])

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
      loading={loading || namespacesLoading}
      options={options}
    />
  })

NamespacePicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  selectFirst: PropTypes.bool,
  clusterId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

NamespacePicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'namespaceId',
  label: 'Namespace',
  formField: false,
  selectFirst: false,
  showAll: true,
}

export default NamespacePicklist
