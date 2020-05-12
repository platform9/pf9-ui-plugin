import React from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import CopyToClipboard from 'core/components/CopyToClipboard'
import InterfacePicklist from './InterfacePicklist'
import PicklistField from 'core/components/validatedForm/PicklistField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { pathOr } from 'ramda'
import InfoTooltipWrapper from 'app/core/components/InfoTooltipWrapper'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'inline-block',
  },
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    fontWeight: 'bold',
  },
  field: {
    width: '50%',
  },
  withCodeBlock: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  title: string
}

const step1CodeBlock = (iface) => {
  return (`ovs-vsctl add-br br-pf9 
ovs-vsctl set bridge br-pf9 other_config:hwaddr=${pathOr("<mac of ethernet interface>", ['mac'], iface)}
ovs-vsctl add-port br-pf9 ${pathOr("<ethernet interface>", ['name'], iface)}
`)
}

const step2CodeBlock = (iface) => {
  return (`BOOTPROTO=none
DEVICE=${pathOr("<interface name>", ['name'], iface)}
ONBOOT=yes
TYPE=Ethernet
USERCTL=no
NM_CONTROLLED=no
TYPE=OVSPort
DEVICETYPE=ovs
OVS_BRIDGE=br-pf9
`)
}

const step3CodeBlock = (iface) => {
  return (`DEVICE=br-pf9
DEVICETYPE=ovs
TYPE=OVSBridge
BOOTPROTO=static
IPADDR=${pathOr("<interface ip>", ['ip'], iface)}
NETMASK=${pathOr("<interface netmask>", ['netmask'], iface)}
ONBOOT=yes
NM_CONTROLLED=no
`)
}

const ControllerNetworkingStep = ({ wizardContext, setWizardContext, onNext, title }: Props): JSX.Element => {
  const { container, text, field, withCodeBlock } = useStyles({})

  return (
    <ValidatedForm
      initialValues={wizardContext}
      onSubmit={setWizardContext}
      triggerSubmit={onNext}
      title={title}
    >
      {({ setFieldValue, values }) => (
        <div className={container}>
          <Typography className={text}>
            Step 1: Select Network Interface
          </Typography>
          <PicklistField
            DropdownComponent={InterfacePicklist}
            id="networkInterface"
            label="Network Interface"
            onChange={(value) => setWizardContext({ networkInterface: value })}
            info="Select an ethernet interface to use to communicate with baremetal nodes.
            If you cannot find the interface you wish to use, you may skip this step and
            fill in the appropriate information manually."
            hostId={wizardContext.selectedHost[0].id}
          />
          <Typography className={text}>
            Step 2: Configure OVS Bridge
          </Typography>
          <InfoTooltipWrapper
            info="Copy and paste the export commands in an SSH session on the
            Bare Metal controller node to create an OVS bridge and add the interface
            as a port."
            className={field}
          >
            <CopyToClipboard fill copyText={step1CodeBlock(wizardContext.networkInterface)}>
              <CodeBlock>
                {step1CodeBlock(wizardContext.networkInterface)}
              </CodeBlock>
            </CopyToClipboard>
          </InfoTooltipWrapper>
          <Typography className={text}>
            Step 3: Configure Ethernet Interface
          </Typography>
          <div className={withCodeBlock}>
            Create a file with path
            <CodeBlock>
              /etc/sysconfig/network-scripts/ifcfg-{pathOr("<ifacename>", ['networkInterface', 'name'], wizardContext)}
            </CodeBlock>
          </div>
          <InfoTooltipWrapper
            info="Configuration for the ethernet interface to be used
            to communicate with Baremetal Nodes. Create a file with the specified path
            and paste the contents provided in the code block."
            className={field}
          >
            <CopyToClipboard fill copyText={step2CodeBlock(wizardContext.networkInterface)}>
              <CodeBlock fill>
                {step2CodeBlock(wizardContext.networkInterface)}
              </CodeBlock>
            </CopyToClipboard>
          </InfoTooltipWrapper>
          <Typography className={text}>
            Step 4: Configure Bridge Interface
          </Typography>
          <div className={withCodeBlock}>
            Create a file with path
            <CodeBlock>/etc/sysconfig/network-scripts/ifcfg-br-pf9</CodeBlock>
          </div>
          <InfoTooltipWrapper
            info="Configuration for the bridge interface. Create a file with the
            specified path and paste the contents provided in the code block."
            className={field}
          >
            <CopyToClipboard fill copyText={step3CodeBlock(wizardContext.networkInterface)}>
              <CodeBlock fill>
                {step3CodeBlock(wizardContext.networkInterface)}
              </CodeBlock>
            </CopyToClipboard>
          </InfoTooltipWrapper>
          <Typography className={text}>
            Step 5: Restart the network service
          </Typography>
          <CopyToClipboard copyText='service network restart'>
            <CodeBlock>
              service network restart
            </CodeBlock>
          </CopyToClipboard>
        </div>
      )}
    </ValidatedForm>
  )
}

export default ControllerNetworkingStep
