import React from 'react'
import DataLoader from 'core/DataLoader'
import { withAppContext } from 'core/AppContext'

const withDataLoader = (loaders, options) => Component => withAppContext(props => {
  return <DataLoader loaders={loaders} options={options} {...props}>
    {loaderProps => <Component {...loaderProps} />}
  </DataLoader>
})

export default withDataLoader
