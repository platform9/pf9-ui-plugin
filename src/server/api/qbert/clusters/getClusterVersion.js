// Currently just returns a default value for all clusters
// TODO: check the error for when a cluster is unable to return this API
// and make it a property specific to each cluster

const getClusterVersion = (req, res) => {
  const response = {
    buildDate: '2018-07-26T10:04:08Z',
    compiler: 'gc',
    gitCommit: 'a21fdbd78dde8f5447f5f6c331f7eb6f80bd684e',
    gitTreeState: 'clean',
    gitVersion: 'v1.10.6',
    goVersion: 'go1.9.3',
    major: '1',
    minor: '10',
    platform: 'linux/amd64'
  }
  return res.send(response)
}

export default getClusterVersion
