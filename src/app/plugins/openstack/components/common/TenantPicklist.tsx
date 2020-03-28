import React, { forwardRef, useMemo, useEffect } from 'react'
import { projectAs } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
import { propOr, head, uniqBy, prop } from 'ramda'
import { allKey } from 'app/constants'
import { mngmTenantActions } from 'k8s/components/userManagement/tenants/actions'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

// How to pass something like ...rest to this?
interface Props {
  name: string
  label: string
  value: string
  selectFirst: boolean
  onChange: (value: string) => void
  showAll: boolean
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const TenantPicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  (props, ref) => {
    const {
      onChange,
      value,
      name = 'tenant',
      label = 'Tenant',
      selectFirst = false,
      showAll = false,
    } = props

    const [tenants, tenantsLoading] = useDataLoader(mngmTenantActions.list)
    // What's the best way to sort the selections alphabetically?
    const options = useMemo(
      () => projectAs({ label: 'name', value: 'id' }, uniqBy(prop('id'), tenants)),
      [tenants],
    )

    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (selectFirst) {
        onChange(propOr(allKey, 'value', head(options)))
      }
    }, [])

    return (
      <Picklist
        name={name}
        label={label}
        value={value}
        ref={ref}
        onChange={onChange}
        options={options}
        loading={tenantsLoading}
        showAll={showAll}
        className='validatedFormInput'
      />
    )
  },
)

export default TenantPicklist
