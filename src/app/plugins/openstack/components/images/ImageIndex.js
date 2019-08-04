import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import ImageListPage from './ImageListPage'
import ImageCardListPage from './ImageCardListPage'

const ImageIndex = () => (
  <Tabs>
    <Tab value="images" label="Imported Images"><ImageListPage /></Tab>
    <Tab value="builtimages" label="Download Prebuilt Images"><ImageCardListPage /></Tab>
  </Tabs>
)

export default ImageIndex
