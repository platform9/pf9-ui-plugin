import Image from '../../models/Image'
import { mapAsJson } from '../../helpers'

const getImages = (req, res) => {
  const images = mapAsJson(Image.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ images })
}

export default getImages
