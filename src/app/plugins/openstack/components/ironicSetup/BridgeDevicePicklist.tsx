import React, { forwardRef, useMemo, useEffect } from 'react'
import { propOr, head } from 'ramda'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadResMgrHosts } from 'k8s/components/infrastructure/common/actions'
import PicklistDefault from 'core/components/Picklist'
import Loading from 'core/components/Loading'
import { IUseDataLoader } from 'k8s/components/infrastructure/nodes/model'
import { ResMgrHost } from 'k8s/components/infrastructure/common/model'
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
const BridgeDevicePicklist: React.ComponentType<Props> = forwardRef<HTMLElement, Props>(
  // ( name = 'severity', label = 'Severity', onChange, selectFirst = true, ...rest }, ref) => {
  (props, ref) => {
    const {
      onChange,
      value,
      name = 'bridgeDevice',
      label = 'Mapping Bridge Device',
      selectFirst = true,
      hostId,
      showAll = false,
      ...rest
    } = props

    const [hosts, hostsLoading, reloadHosts]: IUseDataLoader<ResMgrHost> = useDataLoader(loadResMgrHosts) as any
    const options = useMemo(() => {
      if (hosts.length < 1) { return [] }
      // Pooja requested we not take choices from those ranges.
      // 192.168.122.1 is a libvirt virtual bridge (virbr0) IP
      // 198.51.100.1 is some private IP that WE assign to an interface for running dnsmasq on ironic host
      const host = hosts.find(host => host.id === hostId )
      return host.ovsBridges.map(bridgeDevice => (
        { label: bridgeDevice, value: bridgeDevice }
      ))
    },
      [hosts],
    )

    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (selectFirst && !value) {
        onChange(propOr('', 'value', head(options)))
      }
    }, [options])

    return (
      <div>
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
          loading={hostsLoading}
        />
        <Loading loading={hostsLoading} onClick={reloadHosts}>
          Refresh Bridge Devices
        </Loading>
      </div>
    )
  },
)

export default BridgeDevicePicklist
