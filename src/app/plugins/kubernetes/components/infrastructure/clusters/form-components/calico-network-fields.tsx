import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import { ipValidators } from './validators'
import { NetworkStackTypes } from '../constants'

const calicoIpIPHelpText = {
  Always: 'Encapsulates POD traffic in IP-in-IP between nodes.',
  CrossSubnet:
    'Encapsulation when nodes span subnets and cross routers that may drop native POD traffic, this is not required between nodes with L2 connectivity.',
  Never: 'Disables IP in IP Encapsulation.',
}
const calicoBlockSizeTooltip = {
  [NetworkStackTypes.IPv6]:
    'Block size to use for the IPv6 POOL created at startup. Block size for IPv6 should be in the range 116-128',
  [NetworkStackTypes.IPv4]:
    "Block size determines how many Pod's can run per node vs total number of nodes per cluster. Example /22 enables 1024 IPs per node, and a maximum of 64 nodes. Block size must be greater than 20 and less than 32 and not conflict with the Contain CIDR",
}

const calicoIpIpOptions = [
  { label: 'Always', value: 'Always' },
  { label: 'Cross Subnet', value: 'CrossSubnet' },
  { label: 'Never', value: 'Never' },
]

export enum CalicoDetectionTypes {
  FirstFound = 'first-found',
  CanReach = 'can-reach',
  Interface = 'interface',
  SkipInterface = 'skip-interface',
}

const calicoDetectionOptions = [
  { label: 'First Found', value: CalicoDetectionTypes.FirstFound },
  { label: 'can-reach=<IP OR DOMAIN NAME>', value: CalicoDetectionTypes.CanReach },
  { label: 'interface=<IFACE NAME REGEX LIST>', value: CalicoDetectionTypes.Interface },
  { label: 'skip-interface=<IFACE NAME REGEX LIST>', value: CalicoDetectionTypes.SkipInterface },
]
const detectionMethodLabels = {
  'can-reach': 'IP or Domain Name',
  interface: 'IFace Name Regex List',
  'skip-interface': 'IFace Name Regex List',
}

const CalicoDetectionMethods = ({ values, setValues }) => (
  <>
    <PicklistField
      id="calicoDetectionMethod"
      value={values.calicoDetectionMethod}
      onChange={(value) => setValues({ calicoDetectionMethod: value })}
      label="Interface Detection Method"
      options={calicoDetectionOptions}
      required
    />
    {values.calicoDetectionMethod !== 'first-found' && (
      <TextField
        id="calicoDetectionMethodValue"
        value={values.calicoDetectionMethodValue}
        onChange={(value) => setValues({ calicoDetectionMethodValue: value })}
        info="Use the first valid IP address on the first enumerated interface (same logic as first-found above) that does NOT match with any of the specified interface name regexes. Regexes are separated by commas (e.g. eth.,enp0s.)."
        label={detectionMethodLabels[values.calicoDetectionMethod] || ''}
        required
      />
    )}
  </>
)

const CalicoNetworkFields = ({ values, setValues }) => (
  <>
    <PicklistField
      id="calicoIpIpMode"
      value={values.calicoIpIpMode}
      onChange={(value) => setValues({ calicoIpIpMode: value })}
      label="IP in IP Encapsulation Mode"
      options={calicoIpIpOptions}
      info={calicoIpIPHelpText[values.calicoIpIpMode] || ''}
      required
    />
    <CalicoDetectionMethods values={values} setValues={setValues} />
    <CheckboxField
      id="calicoNatOutgoing"
      value={values.calicoNatOutgoing}
      onChange={(value) => setValues({ calicoNatOutgoing: value })}
      label="NAT Outgoing"
      info="Packets destined outside the POD network will be SNAT'd using the node's IP."
    />
    <TextField
      id="calicoBlockSize"
      value={values.calicoBlockSize}
      onChange={(value) => setValues({ calicoBlockSize: value })}
      label="Block Size"
      info={calicoBlockSizeTooltip?.[values.networkStack]}
      required
      validations={[
        ipValidators?.[values.networkStack]?.blockSizeValidator,
        ipValidators?.[values.networkStack]?.calicoBlockSizeCIDRValidator,
      ]}
    />
    <TextField
      id="mtuSize"
      value={values.mtuSizees}
      onChange={(value) => setValues({ mtuSize: value })}
      label="MTU Size"
      info="Maximum Transmission Unit (MTU) for the interface (in bytes)"
      required
    />
  </>
)

export default CalicoNetworkFields
