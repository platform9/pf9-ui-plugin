import React, { useMemo, forwardRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { head, isEmpty, propOr } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import { appVersionLoader } from 'k8s/components/apps/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const AppVersionPicklist = forwardRef(
  ({ clusterId, appId, release, loading, onChange, selectFirst, ...rest }, ref) => {
    const [versions, versionsLoading] = useDataLoader(appVersionLoader, {
      clusterId, appId, release,
    })
    const options = useMemo(() => projectAs(
      { label: 'version', value: 'version' }, versions,
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
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  selectFirst: PropTypes.bool,
  clusterId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  appId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  release: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

AppVersionPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'repositoryId',
  label: 'AppVersion',
  formField: false,
  showAll: false,
  selectFirst: true,
}

export default AppVersionPicklist
