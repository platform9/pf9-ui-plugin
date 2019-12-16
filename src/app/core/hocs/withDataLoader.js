import React from 'react'
import DataLoader from 'core/DataLoader'

const withDataLoader = (loaders, options) => Component => props => {
  return <DataLoader loaders={loaders} options={options} {...props}>
    {loaderProps => <Component {...loaderProps} />}
  </DataLoader>
}

export default withDataLoader
