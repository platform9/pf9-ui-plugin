import Image from '../../models/Image'

const deleteImage = (req, res) => {
  // TODO: account for tenancy
  const { imageId } = req.params
  console.log('Attempting to delete imageId: ', imageId)
  const image = Image.findById(imageId)
  if (!image) {
    console.log('Image NOT found')
    return res.status(404).send({ err: 'Image not found' })
  }
  image.destroy()
  console.log('Image destroyed')
  res.status(200).send({})
}

export default deleteImage
