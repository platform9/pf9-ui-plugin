import React from 'react'
import CodeBlock from 'core/components/CodeBlock'
import TextField from 'core/components/validatedForm/TextField'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles((theme: Theme) => ({
  inline: {
    display: 'grid',
  },
}))

const HttpProxyField = ({}) => {
  const classes = useStyles()
  return (
    <TextField
      id="httpProxy"
      label="HTTP Proxy"
      infoPlacement="right-end"
      info={
        <div className={classes.inline}>
          Specify the HTTP proxy for this cluster. Format{' '}
          <CodeBlock>
            <span>{'<scheme>://<username>:<password>@<host>:<port>'}</span>
          </CodeBlock>{' '}
          username and password are optional.
        </div>
      }
    />
  )
}

export default HttpProxyField
