import React, { forwardRef, useMemo, useEffect } from 'react'
import { prop, propOr, head, uniqBy } from 'ramda'
import useDataLoader from 'core/hooks/useDataLoader'
import networkActions from 'openstack/components/networks/actions'
import { projectAs } from 'utils/fp'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

interface Props {
  name: string
  label: string
  value: string
  selectFirst: boolean
  onChange: (value: string) => void
  showAll: boolean
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const ProvisioningNetworkPicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  (props, ref) => {
    const {
      onChange,
      value,
      name = 'provisioningNetwork',
      label = 'Provisioning Network',
      selectFirst = true,
      showAll = false,
      ...rest
    } = props

    // const [networks, networksLoading] = useDataLoader(networkActions.list)
    const [networks] = useDataLoader(networkActions.list)
    const options = useMemo(() => {
      const ironicNetworks = networks.filter((network) => (
        network['provider:physical_network'] === 'provisioning'
      ))
      return projectAs({ label: 'name', value: 'id' }, uniqBy(prop('id'), ironicNetworks))
    },
      [networks],
    )

    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (selectFirst && !value) {
        onChange(propOr('', 'value', head(options)))
      }
    }, [])

    return (
      <Picklist
        {...rest}
        name={name}
        label={label}
        value={value}
        ref={ref}
        onChange={onChange}
        options={options}
        showAll={showAll}
        className='validatedFormInput'
      />
    )
  },
)

export default ProvisioningNetworkPicklist
