import React, { forwardRef, useMemo } from 'react'
import PicklistDefault from 'core/components/Picklist'
import { loadSupportedRoleVersions } from '../infrastructure/clusters/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const KubernetesVersionPicklist = forwardRef(({ ...rest }, ref) => {
  const [roles, loading] = useDataLoader(loadSupportedRoleVersions)
  const options = useMemo(() => projectAs({ value: 'roleVersion', label: 'roleVersion' }, roles), [
    roles,
  ])
  return <Picklist {...rest} loading={loading} ref={ref} options={options} />
})

export default KubernetesVersionPicklist
