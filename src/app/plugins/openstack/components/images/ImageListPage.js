import React from 'react'
import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadImages } from './actions'
import ImageListContainer from './ImageListContainer'

const ImageListPage = () =>
  <DataLoader loaders={{ images: loadImages }}>
    {({ data }) => <ImageListContainer images={data.images} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(ImageListPage)
