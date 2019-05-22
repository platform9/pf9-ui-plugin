import React from 'react'
import Panel from './Panel'
import Tab from 'core/components/Tab'
import Tabs from 'core/components/Tabs'
import {
  Button,
  Typography,
} from '@material-ui/core'
import { withAppContext } from 'core/AppContext'

const typographyVariants = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'subtitle1', 'subtitle2', 'body1', 'body2',
  'caption', 'button', 'overline'
]

const KitchenSink = ({ context: { theme } }) => (
  <div>
    <Panel title="Buttons">
      <Button variant="contained">Default</Button>
      <Button variant="contained" color="primary">Primary</Button>
      <Button variant="contained" color="secondary">Secondary</Button>
    </Panel>

    <Panel title="Tabs">
      <Tabs>
        <Tab value="first" label="First one">
          <Typography variant="subtitle1">First tab contents</Typography>
        </Tab>
        <Tab value="second" label="Second">
          <Typography variant="subtitle1">Second tab contents</Typography>
        </Tab>
      </Tabs>
    </Panel>

    <Panel title="Typography" defaultExpanded={false}>
      <div>
        {typographyVariants.map(variant =>
          <div key={variant}>
            <Typography variant={variant}>{variant}</Typography>
            <br />
          </div>
        )}
      </div>
    </Panel>

    <Panel title="Raw theme JSON" defaultExpanded>
      <pre>{JSON.stringify(theme.typography, null, 4)}</pre>
    </Panel>
  </div>
)

export default withAppContext(KitchenSink)
