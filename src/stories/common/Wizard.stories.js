import React from 'react'
import { addStoriesFromModule } from '../helpers'
import WizardStep from 'core/components/wizard/WizardStep'
import Wizard from 'core/components/wizard/Wizard'
import { action } from '@storybook/addon-actions'

const addStories = addStoriesFromModule(module)

addStories('Wizard', {
  Default: () => (
    <Wizard onComplete={action('Submit action')}>
      {[
        <WizardStep key="first" stepId="first" label="First" info="This is the first">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Risus
          pretium quam vulputate dignissim suspendisse in. Scelerisque in
          dictum non consectetur a erat. Sagittis id consectetur purus ut
          faucibus pulvinar elementum integer.
        </WizardStep>,
        <WizardStep key="second" stepId="second" label="Second" info="This is the second">
          Pretium nibh ipsum consequat nisl vel pretium lectus quam. Curabitur vitae
          nunc sed velit dignissim sodales ut eu. Leo in vitae turpis massa sed
          elementum tempus. Vulputate dignissim suspendisse in est. Nisi est sit
          amet facilisis magna etiam tempor. Convallis aenean et tortor at risus
          viverra adipiscing at.
        </WizardStep>,
        <WizardStep key="third" stepId="third" label="Third" info="This is the third">
          Dolor magna eget est lorem ipsum dolor sit amet. Velit euismod in pellentesque
          massa. Porttitor lacus luctus accumsan tortor posuere.
        </WizardStep>,
      ]}
    </Wizard>
  ),
})
