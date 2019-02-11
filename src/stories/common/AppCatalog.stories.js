import { action } from '@storybook/addon-actions'
import React from 'react'
import ApplicationsListContainer
  from '../../app/core/components/appCatalog/ApplicationsListContainer'
import { addStoriesFromModule } from '../helpers'

const addStories = addStoriesFromModule(module)
const handleAddToEnv = action('AddToEnv')
const handleDeploy = action('Deploy')
const handleEdit = action('Edit')
const handleDetail = action('Detail')
const handleDownload = action('Download')
const handleDelete = action('Delete')

addStories('Common Components/App Catalog', {
  'Default': () => (
    <ApplicationsListContainer applications={[{
      'name': 'Aerospike',
      'description': 'A helm chart for Aerospike in Kubernetes',
      'tenant': 'tenant',
      'handleAddToEnv': handleAddToEnv,
      'handleDeploy': handleDeploy,
      'handleEdit': handleEdit,
      'handleDetail': handleDetail,
      'handleDownload': handleDownload,
      'handleDelete': handleDelete,
    }, {
      'name': 'Airflow',
      'description': 'Airflow is a platfor asdasdsadasdsa fdsm for to programatically author, schedule and monitor workflows',
      'tenant': 'tenant'
    }, {
      'name': 'Airflow',
      'description': 'Airflow is a platform for to programatically author, schedule and monitor workflows',
      'tenant': 'tenant'
    }, {
      'name': 'Anchore-Engine',
      'description': 'Anchore container analysis and policy evaluation engine service',
      'tenant': 'tenant'
    }, {
      'name': 'Apm-Server',
      'description': 'The server receives data from Elastic APM agents and stores the data into a datastore like Elasticsearch',
      'tenant': 'tenant'
    }]} />
  ),
})
