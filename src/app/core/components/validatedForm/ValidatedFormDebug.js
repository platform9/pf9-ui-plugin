import React from 'react'

import { ValidatedFormConsumer } from 'core/components/validatedForm/ValidatedForm'

/* This component is primarily designed to be used as a debugging tool to
 * show the form context during development.
 */
const ValidatedFormDebug = () => (
  <ValidatedFormConsumer>
    {props => <pre>{JSON.stringify(props, null, 4)}</pre>}
  </ValidatedFormConsumer>

)

export default ValidatedFormDebug
