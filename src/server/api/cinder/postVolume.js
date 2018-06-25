import Volume from '../../models/Volume'

const postVolume = (req, res) => {
  // TODO: account for tenancy
  // const { tenantId } = req.params
  const volume = req.body.flavor
  const newVolume = new Volume(volume)
  res.status(201).send({ volume: newVolume.asJson() })
}

export default postVolume
