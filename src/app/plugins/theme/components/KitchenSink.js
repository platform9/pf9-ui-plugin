import React from 'react'
import Panel from './Panel'
import ButtonsExample from './examples/ButtonsExample'
import FormExample from './examples/FormExample'
import TabsExample from './examples/TabsExample'
import TablesExample from './examples/TablesExample'
import WizardExample from './examples/WizardExample'
import TypographyExample from './examples/TypographyExample'
import { withAppContext } from 'core/providers/AppProvider'

const KitchenSink = ({ context: { theme } }) => (
  <div>
    <FormExample />
    <WizardExample />
    <ButtonsExample expanded />
    <TabsExample expanded />
    <TablesExample expanded />
    <TypographyExample />

    <Panel title="Raw theme JSON" defaultExpanded>
      <pre>{JSON.stringify(theme, null, 4)}</pre>
    </Panel>
  </div>
)

export default withAppContext(KitchenSink)
