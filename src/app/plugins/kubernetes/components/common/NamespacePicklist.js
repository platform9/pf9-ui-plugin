import React, { forwardRef, useMemo, useEffect } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head, omit } from 'ramda'
import { allKey } from 'app/constants'
import namespaceActions from 'k8s/components/namespaces/actions'

const NamespacePicklist = forwardRef(
  ({ clusterId, loading, onChange, value, showNone, ...rest }, ref) => {
    const [namespaces, namespacesLoading] = useDataLoader(namespaceActions.list, { clusterId })
    const options = useMemo(() => projectAs(
      { label: 'name', value: 'name' }, namespaces,
    ), [namespaces])
    // Select the first namespace as soon as namespaces are loaded
    useEffect(() => {
      if (!isEmpty(options)) {
        onChange(propOr(allKey, 'value', head(options)))
      }
    }, [options])

    return <Picklist
      {...rest}
      ref={ref}
      showNone={showNone}
      onChange={onChange}
      disabled={isEmpty(options) && !showNone}
      value={value || propOr(allKey, 'value', head(options))}
      loading={loading || namespacesLoading}
      options={options}
    />
  })

NamespacePicklist.propTypes = {
  ...omit(['options'], Picklist.propTypes),
  name: PropTypes.string,
  label: PropTypes.string,
  clusterId: PropTypes.number,
}

NamespacePicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'namespaceId',
  label: 'Current Namespace',
}

export default NamespacePicklist
