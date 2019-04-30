import React from 'react'
import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadImages } from './actions'
import ImageListContainer from './ImageListContainer'

const ImageListPage = () =>
  <DataLoader dataKey="images" loaders={loadImages}>
    {({ data }) => <ImageListContainer images={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(ImageListPage)
