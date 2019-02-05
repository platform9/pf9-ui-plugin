const calcMethods = {
  activity: require('../symbols/ActivitySymbol')
}

const calcCoord = (type, node) => {
  const symbol = calcMethods[node.type]
  const methodName = type === 'source' ? 'wireStart' : 'wireEnd'
  const method = symbol && symbol[methodName]
  const coords = method ? method(node) : [node.x, node.y]
  return coords
}

const calcWireCoords = (source, dest) => {
  let start = calcCoord('source', source)
  let end = calcCoord('dest', dest)
  return { x1: start[0], y1: start[1], x2: end[0], y2: end[1] }
}

export default calcWireCoords
