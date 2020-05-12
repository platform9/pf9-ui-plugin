import React, { forwardRef, useMemo, useEffect } from 'react'
import { propOr, head } from 'ramda'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

interface Props {
  name: string
  label: string
  value: string
  selectFirst: boolean
  onChange: (value: string) => void
  hostId: string
  showAll: boolean
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const InterfacePicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  (props, ref) => {
    const {
      onChange,
      value,
      name = 'iface',
      label = 'Network Interface',
      selectFirst = false,
      hostId,
      showAll = false,
      ...rest
    } = props

    const [hosts, hostsLoading] = useDataLoader(loadResMgrHosts)
    const options = useMemo(() => {
      // Pooja requested we not take choices from those ranges.
      // 192.168.122.1 is a libvirt virtual bridge (virbr0) IP
      // 198.51.100.1 is some private IP that WE assign to an interface for running dnsmasq on ironic host
      if (hosts.length < 1) { return [] }
      const host = hosts.find(host => host.id === hostId)
      return host.networkInterfaces.map(iface => (
        { label: iface.label, value: iface }
      ))
    },
      [hosts],
    )

    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (selectFirst) {
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
        loading={hostsLoading}
        className='validatedFormInput'
      />
    )
  },
)

export default InterfacePicklist
