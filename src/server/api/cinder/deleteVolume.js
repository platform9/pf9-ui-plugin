import Volume from '../../models/Volume'

const deleteVolume = (req, res) => {
  // TODO: account for tenancy
  const { volumeId } = req.params
  console.log('Attempting to delete volumeId: ', volumeId)
  const volume = Volume.findById(volumeId)
  if (!volume) {
    console.log('Volume NOT found')
    return res.status(404).send({ err: 'Volume not found' })
  }
  volume.destroy()
  console.log('Volume destroyed')
  res.status(200).send({})
}

export default deleteVolume
