import React from 'react'
import { addStoriesFromModule } from '../helpers'
import Alert from 'core/components/Alert'

const addStories = addStoriesFromModule(module)

const content = <>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce auctor, lorem in faucibus
    finibus, odio sapien lobortis eros, a auctor massa risus in odio. Suspendisse tempus lorem
    vel sapien pretium, sed varius sapien ornare. In at auctor tellus. Morbi tempor efficitur
    risus a volutpat. Nullam vel neque aliquam, eleifend nulla et, aliquet sapien. Nulla
    fermentum posuere lorem, sit amet ultricies sem eleifend vel. Sed libero tellus,
    pellentesque at leo quis, fermentum congue est. Proin gravida consequat neque, eu molestie
    risus facilisis non.
  </p>
  <p>
    Fusce feugiat massa mauris, eu mollis leo rhoncus quis. Curabitur efficitur ligula quis
    tellus rutrum elementum. Phasellus sit amet leo ut diam ornare laoreet. Aenean euismod metus
    justo, et commodo lorem scelerisque eu. Vivamus nec velit at arcu convallis lacinia. In hac
    habitasse platea dictumst. Mauris elit turpis, elementum a luctus faucibus, consectetur id
    arcu.
  </p>
  <p>
    Ut vitae lobortis lectus. Nulla consectetur egestas libero, at sollicitudin mi tincidunt
    non. Aenean condimentum placerat nisi. Curabitur consequat quam quis purus finibus gravida.
    Cras dui mauris, dignissim id enim vel, sagittis finibus velit. Curabitur non lectus
    sagittis, rutrum nisl sed, congue tortor. Vestibulum semper imperdiet ipsum, at consectetur
    lectus hendrerit ut.
  </p>
</>

addStories('Common Components/Alert', {
  'info': () => (
    <Alert variant="info">
      {content}
    </Alert>
  ),
  'success': () => (
    <Alert variant="success">
      {content}
    </Alert>
  ),
  'warning': () => (
    <Alert variant="warning">
      {content}
    </Alert>
  ),
  'error': () => (
    <Alert variant="error">
      {content}
    </Alert>
  ),
})
