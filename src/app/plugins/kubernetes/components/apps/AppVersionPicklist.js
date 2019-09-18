import React, { useMemo, forwardRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { head, isEmpty, omit, propOr } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import { appVersionLoader } from 'k8s/components/apps/actions'

const AppVersionPicklist = forwardRef(
  ({ clusterId, appId, loading, onChange, selectFirst, ...rest }, ref) => {
    const [versions, versionsLoading] = useDataLoader(appVersionLoader, {
      clusterId, appId,
    })
    const options = useMemo(() => projectAs(
      { label: 'name', value: 'id' }, versions,
    ), [versions])

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
      loading={loading || versionsLoading}
      options={options}
    />
  })

AppVersionPicklist.propTypes = {
  ...omit(['options'], Picklist.propTypes),
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  selectFirst: PropTypes.bool,
  clusterId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  appId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
}

AppVersionPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'repositoryId',
  label: 'AppVersion',
  formField: false,
  showAll: true,
  selectFirst: false,
}

export default AppVersionPicklist
