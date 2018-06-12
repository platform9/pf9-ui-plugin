import Catalog from '../../models/Catalog'

const getCatalog = (req, res) => {
  const catalog = Catalog.getCatalog()
  return res.send({ catalog })
}

export default getCatalog
