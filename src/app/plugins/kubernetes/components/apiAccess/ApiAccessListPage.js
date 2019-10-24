import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import apiAccessActions from './actions'


const ApiAccessListPage = () => {
    const columns = getColumns();

    const options = {
        cacheKey: 'apiAccess',
        uniqueIdentifier: 'service',
        loaderFn: apiAccessActions.list,
        columns,
        name: 'API Access',
        title: 'API Access',
        uniqueIdentifier: 'id'
    }

    const { ListPage } = createCRUDComponents(options);

    return <ListPage />
};

const getColumns = () => [
    { id: 'service', label: 'Service' },
    { id: 'type', label: 'Type' },
    { id: 'url', label: 'URL' }
  ]

export default ApiAccessListPage;