import React from 'react'
import { jsonDetailLogger, addStories } from '../helpers'

import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

addStories('Form Handling/ValidatedForm', {
  'Without any fields': () => (
    <ValidatedForm onSubmit={jsonDetailLogger('ValidatedForm#submit')}>
      <button type="submit">submit</button>
    </ValidatedForm>
  ),

  'Render arbitrary children': () => (
    <ValidatedForm onSubmit={jsonDetailLogger('ValidatedForm#submit')}>
      <div>
        <h1>Any valid JSX works within ValidatedForm</h1>
        <p>I do what I want</p>
      </div>
      <button type="submit">submit</button>
    </ValidatedForm>
  ),

  'Field state gets propagated up': () => (
    <ValidatedForm
      onSubmit={jsonDetailLogger('ValidatedForm#submit')}
      initialValue={{ name: 'existing name' }}
    >
      <TextField id="name" placeholder="Name" label="Name" />
      <br />
      <TextField id="description" placeholder="Description" />
      <button type="submit">Submit</button>
    </ValidatedForm>
  )
})
