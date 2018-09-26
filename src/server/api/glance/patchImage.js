import Image from '../../models/Image'

const patchImage = (req, res) => {
  // TODO: account for tenancy
  const { imageId } = req.params
  const attributes = req.body
  const updatedImage = Image.updateById(imageId, attributes)
  if (!updatedImage) {
    console.log('Image NOT found')
    return res.status(404).send({ err: 'Image not found' })
  }
  res.status(200).send(updatedImage.asJson())
}

export default patchImage
