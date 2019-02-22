import context from '../../../context'
import Cluster from '../../../models/qbert/Cluster'

const getKubeConfig = (req, res) => {
  const { clusterId } = req.params
  const cluster = Cluster.findById({ id: clusterId, context })

  if (!cluster) {
    return res.status(404).send({code: 404, message: 'cluster not found'})
  }

  const yamlString = `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURYRENDQWtTZ0F3SUJBZ0lKQUkwb1BLcmwwRUZZTUEwR0NTcUdTSWIzRFFFQkN3VUFNQ014SVRBZkJnTlYKQkFNTUdHdDFZbVZ5Ym1WMFpYTXRZMkZBTVRVek5EZzNOekV4TmpBZUZ3MHhPREE0TWpFeE9EUTFNVGRhRncweQpPREE0TVRneE9EUTFNVGRhTUNNeElUQWZCZ05WQkFNTUdHdDFZbVZ5Ym1WMFpYTXRZMkZBTVRVek5EZzNOekV4Ck5qQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU1FaU8wU1Z1cHY4OE5maGlOQ3QKY2lNdFR6empiWWlLYUppYUNUbE9Gb3d2ODdnQUJ3ekRaOTNRYUlsNzFacHpoOWk5TkxPaDdjbmNBK3Z6VHlPawpVanlOZDJYMWNWNGFuRFo1WkU1bGZGYU9ZRUxXeVovVSsrbk00N3Zicjk3MmdIMVI2TENRVmQyTC9kTkdxeU9wCk1pNWt4TkxKWTlRa3EzUlVVdy9objVlRW1RQTZPQ2J3ZVVEVFBzMks5TnU3dTM0YTJaMWc2WkFrQWNra1NKd2EKUjZOWVdMZzRHSUxnRVhGekNxYzFNRDloSGxTaDg1TDRlUlhZeGZUZ3czdXdpa0lVdFVycmNHVEpGWHEvdlpGVgpBVzFneUFQN01vYm1tOFZpY2gwb2NHa2MxYjA0WllRMnhyb1JOZ3NINnViSno2SUxNOHhOYzNKcitGVGx6K2ZICm84VUNBd0VBQWFPQmtqQ0JqekFkQmdOVkhRNEVGZ1FVM2RFU25NcUo2QXdTZTIvdWpVK2d2SXlRNzZZd1V3WUQKVlIwakJFd3dTb0FVM2RFU25NcUo2QXdTZTIvdWpVK2d2SXlRNzZhaEo2UWxNQ014SVRBZkJnTlZCQU1NR0d0MQpZbVZ5Ym1WMFpYTXRZMkZBTVRVek5EZzNOekV4Tm9JSkFJMG9QS3JsMEVGWU1Bd0dBMVVkRXdRRk1BTUJBZjh3CkN3WURWUjBQQkFRREFnRUdNQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUNERVpBcEZISjNkYmQvZ0w2VXlFUVAKclZPelBpT0xBbG9vTVE1YXFCYW1NcjBwYU9zQmdNSnBIcjNzT0xrRXJLckZEVUVjK2JISXErR2tHMkYxQlNwTAozanJ6VC9EVUhSTGZMNnJwK3hQbnZ6dTI3QVRIN3pkZ1dsZFVDem9ZdDNHUzhVSFRNUTUvQXZHUXZZOUswTEIzCmFiWE16SHpDZE5lVkVGTXZtUUdGaHFuK0xyYmxWM0FhY0VrSUtEa3pEeGcyczZieW5KYTFFWVh0b1lBZDFwRncKYVl3NnRtQ2pWanMwZVM0ODAyaUpQMk9FRXd1cnZ0ZkRxS21QR3J4cmtUb0s2STVyWkJtQzRpcGtncUVDU2FCbQpURDJDM29hZjB1KzFwRmoyZDk1UVFvZmdkYlVDNWR3d2RZZUtBU1BISFF6Wlp5SDNYaEVxTGp1MkR1MXVLM2tsCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
    server: https://10.105.16.26
  name: ${cluster.name}
contexts:
- context:
    cluster: ${cluster.name}
    namespace: default
    user: user@platform9.net
  name: default
current-context: default
kind: Config
preferences: {}
users:
- name: user@platform9.net
  user:
    token: __INSERT_BEARER_TOKEN_HERE__`

  return res.status(200).send(yamlString)
}

export default getKubeConfig
