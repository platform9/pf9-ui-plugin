import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import ImageListPage from './ImageListPage'
import ImageCardListPage from './ImageCardListPage'
import PageContainer from 'core/components/pageContainer/PageContainer'

const ImageIndex = () => (
  <PageContainer>
    <Tabs>
      <Tab value="images" label="Imported Images"><ImageListPage /></Tab>
      <Tab value="builtimages" label="Download Prebuilt Images"><ImageCardListPage /></Tab>
    </Tabs>
  </PageContainer>
)

export default ImageIndex
