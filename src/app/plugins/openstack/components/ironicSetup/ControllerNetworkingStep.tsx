import React, { useCallback, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import CodeBlock from 'core/components/CodeBlock'
import Theme from 'core/themes/model'
import CopyToClipboard from 'core/components/CopyToClipboard'
import InterfacePicklist from './InterfacePicklist'
import PicklistField from 'core/components/validatedForm/PicklistField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { pathOr } from 'ramda'
import InfoTooltipWrapper from 'app/core/components/InfoTooltipWrapper'
import ExpansionPanel from 'core/components/expansionPanel/ExpansionPanel'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'inline-block',
  },
  field: {
    width: '50%',
  },
  withCodeBlock: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
  },
  insidePanelContainer: {
    width: '100%',
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  title: string
}

enum Panels {
  NetworkInterface = 0,
  OvsBridge = 1,
  EthernetInterface = 2,
  BridgeInterface = 3,
  Restart = 4,
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
  const { container, field, withCodeBlock, insidePanelContainer } = useStyles({})

  const [activePanels, setActivePanels] = useState(new Set([Panels.NetworkInterface]))

  const togglePanel = useCallback(
    (panel) => () => {
      const newPanels = new Set(activePanels)
      const operation = activePanels.has(panel) ? 'delete' : 'add'
      newPanels[operation](panel)
      setActivePanels(newPanels)
    },
    [activePanels],
  )

  return (
    <ValidatedForm
      initialValues={wizardContext}
      onSubmit={setWizardContext}
      triggerSubmit={onNext}
      title={title}
    >
      {({ setFieldValue, values }) => (
        <div className={container}>
          <ExpansionPanel
            expanded={activePanels.has(Panels.NetworkInterface)}
            onClick={togglePanel(Panels.NetworkInterface)}
            stepNumber={1}
            completed={false}
            summary="Select Network Interface"
          >
            <div className={insidePanelContainer}>
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
            </div>
          </ExpansionPanel>
          <ExpansionPanel
            expanded={activePanels.has(Panels.OvsBridge)}
            onClick={togglePanel(Panels.OvsBridge)}
            stepNumber={2}
            completed={false}
            summary="Configure OVS Bridge"
          >
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
          </ExpansionPanel>
          <ExpansionPanel
            expanded={activePanels.has(Panels.EthernetInterface)}
            onClick={togglePanel(Panels.EthernetInterface)}
            stepNumber={3}
            completed={false}
            summary="Configure Ethernet Interface"
          >
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
          </ExpansionPanel>
          <ExpansionPanel
            expanded={activePanels.has(Panels.BridgeInterface)}
            onClick={togglePanel(Panels.BridgeInterface)}
            stepNumber={4}
            completed={false}
            summary="Configure Bridge Interface"
          >
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
          </ExpansionPanel>
          <ExpansionPanel
            expanded={activePanels.has(Panels.Restart)}
            onClick={togglePanel(Panels.Restart)}
            stepNumber={5}
            completed={false}
            summary="Restart Network Service"
          >
            <CopyToClipboard copyText='service network restart'>
              <CodeBlock>
                service network restart
              </CodeBlock>
            </CopyToClipboard>
          </ExpansionPanel>
        </div>
      )}
    </ValidatedForm>
  )
}

export default ControllerNetworkingStep
