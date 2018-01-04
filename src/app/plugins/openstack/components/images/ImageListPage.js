import React from 'react'
import { compose } from 'core/../../../../utils/fp'
import ImageListContainer from './ImageListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { loadImages } from './actions'

const ImageListPage = () =>
  <DataLoader dataKey="images" loaderFn={loadImages}>
    {({ data }) => <ImageListContainer images={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(ImageListPage)
