import {Config} from './../types'


export const testConfig:Config={
    loginCredentials: {
        username: 'test.user@afourtech.com',
        password: 'Afour@123',
        completeName: 'Test User'
    },
    singleMasterClusterData: {
        clusterName: 'SingleMasterCluster-1',
        totalNodes: 2,
        masterNodes: 1,
        workerNodes: 1  
    },
    multiMasterClusterData: {
        clusterName: 'MultiMasterCluster-1',
        totalNodes: 5,
        masterNodes: 3,
        workerNodes: 2,
        virtualIP: '10.128.146.121'  
    },
    oneClickClusterData: {
        clusterName: 'OneClickCluster-1',
        totalNodes: 1,   
    },
    namespaceName: 'test-mabl'


}