import Volume from '../../models/openstack/Volume'

const postVolume = (req, res) => {
  // TODO: account for tenancy
  // const { tenantId } = req.params
  const volume = req.body.volume
  const newVolume = new Volume(volume)
  res.status(201).send({ volume: newVolume.asJson() })
}

export default postVolume
