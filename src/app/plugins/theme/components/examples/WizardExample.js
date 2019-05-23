import React from 'react'
import Panel from '../Panel'
import Wizard from 'core/components/Wizard'
import WizardStep from 'core/components/WizardStep'

const nop = () => {}
const initialContext = {}

const WizardExample = ({ expanded = false }) => (
  <Panel title="Wizard" defaultExpanded={expanded}>
    <Wizard onComplete={nop} context={initialContext}>
      {() => (
        <div>
          <WizardStep stepId="first" label="First" info="This is the first">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Risus
            pretium quam vulputate dignissim suspendisse in. Scelerisque in
            dictum non consectetur a erat. Sagittis id consectetur purus ut
            faucibus pulvinar elementum integer.
          </WizardStep>

          <WizardStep stepId="second" label="Second" info="This is the second">
            Pretium nibh ipsum consequat nisl vel pretium lectus quam. Curabitur vitae
            nunc sed velit dignissim sodales ut eu. Leo in vitae turpis massa sed
            elementum tempus. Vulputate dignissim suspendisse in est. Nisi est sit
            amet facilisis magna etiam tempor.  Convallis aenean et tortor at risus
            viverra adipiscing at.
          </WizardStep>

          <WizardStep stepId="third" label="Third" info="This is the third">
            Dolor magna eget est lorem ipsum dolor sit amet. Velit euismod in pellentesque
            massa. Porttitor lacus luctus accumsan tortor posuere.
          </WizardStep>
        </div>
      )}
    </Wizard>
  </Panel>
)

export default WizardExample
