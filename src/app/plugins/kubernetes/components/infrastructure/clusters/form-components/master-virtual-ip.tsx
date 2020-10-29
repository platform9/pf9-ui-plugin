import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import VipInterfaceChooser from '../bareos/VipInterfaceChooser'
import { pf9PmkArchitectureDigLink } from 'k8s/links'
import { IconInfo } from 'core/components/validatedForm/Info'
import BulletList from 'core/components/BulletList'

const MasterVipFields = ({ withInfo = false }) => (
  <>
    {withInfo && (
      <IconInfo
        icon="info-circle"
        title="Mult-Master Clusters utilise VRRP for HA & Load Balancing."
        spacer={false}
      >
        <BulletList
          items={[
            'Ensure virtual machine port security & firewalls are configured to allow ingress and egress traffic.',
            'Ensure the Virtual IP is a reserved Network IP to avoid IP Conflicts',
          ]}
        />
      </IconInfo>
    )}
    <TextField
      id="masterVipIpv4"
      label="Virtual IP address for cluster"
      info={
        <div>
          The virtual IP address to provide access to the API server endpoint for this cluster. A
          virtual IP must be specified to grow the number of masters in the future. Refer to{' '}
          <a href={pf9PmkArchitectureDigLink} target="_blank">
            this article
          </a>{' '}
          for help on VIP operations and configuration
        </div>
      }
      required
    />

    <PicklistField
      DropdownComponent={VipInterfaceChooser}
      id="masterVipIface"
      label="Physical interface for virtual IP association"
      infoPlacement="right-end"
      info="The name of the network interface that the virtual IP will be bound. The virtual IP must be reachable from the network the interface connects to. All master nodes must use the same interface (eg: ens3)."
      required
    />
  </>
)
export default MasterVipFields
