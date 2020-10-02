import React from 'react'
import EnpointsListPage from './endpoints/EndpointsListPage'
import { makeStyles } from '@material-ui/core/styles'
import ApiHelper from 'developer/components/ApiHelper'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: 700,
  },
  apiHelper: {
    width: 'auto',
  },
}))

const ApiAccessListPage = () => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <EnpointsListPage />
      <FormFieldCard title="API Helper">
        <ApiHelper classes={{ root: classes.apiHelper }} elevated={false} />
      </FormFieldCard>
    </div>
  )
}

export default ApiAccessListPage
